import { useRef, useEffect, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { MetaNode, MetaLink, MetaLayer } from '../types';
import { useI18n } from '../i18n';
import { createSeededRng } from '../../../shared/utils/seededRng';

const LAYER_COLORS: Record<MetaLayer, string> = {
  raw: '#94a3b8',
  findings: '#60a5fa',
  hypotheses: '#f87171',
  differential: '#fbbf24',
  evidence: '#a78bfa',
};

interface ThreeGraphProps {
  nodes: MetaNode[];
  links: MetaLink[];
  focusId: string;
  onNodeClick?: (nodeId: string) => void;
}

export function ThreeGraph({ nodes, links, focusId, onNodeClick }: ThreeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const rng = useMemo(() => createSeededRng(focusId + nodes.length), [focusId, nodes.length]);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    nodeMeshes: Map<string, THREE.Mesh>;
    frameId: number;
  } | null>(null);

  const initScene = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 30);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 100;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    sceneRef.current = { renderer, scene, camera, controls, nodeMeshes: new Map(), frameId: 0 };
  }, []);

  const buildGraph = useCallback(() => {
    const ref = sceneRef.current;
    if (!ref) return;
    const { scene, nodeMeshes } = ref;

    // Clear previous
    nodeMeshes.forEach((m) => scene.remove(m));
    nodeMeshes.clear();
    scene.children = scene.children.filter(
      (c) => c instanceof THREE.Light || c instanceof THREE.Camera
    );

    if (nodes.length === 0) return;

    // Position nodes in 3D using simple force-like layout
    const nodePositions = new Map<string, THREE.Vector3>();
    const layerOffset: Record<MetaLayer, number> = {
      raw: -8,
      findings: -4,
      hypotheses: 0,
      differential: 4,
      evidence: 8,
    };

    nodes.forEach((node, i) => {
      const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
      const radius = 6 + rng() * 4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = layerOffset[node.layer] + (rng() - 0.5) * 2;
      nodePositions.set(node.id, new THREE.Vector3(x, y, z));
    });

    // Links
    links.forEach((link) => {
      const src = nodePositions.get(link.source);
      const tgt = nodePositions.get(link.target);
      if (!src || !tgt) return;

      const material = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.4,
      });
      const geometry = new THREE.BufferGeometry().setFromPoints([src, tgt]);
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    });

    // Nodes
    nodes.forEach((node) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const colorHex = LAYER_COLORS[node.layer];
      const color = new THREE.Color(colorHex);

      const geometry = new THREE.SphereGeometry(node.id === focusId ? 1.2 : 0.7, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: node.id === focusId ? 0.5 : 0.2,
        roughness: 0.4,
        metalness: 0.3,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(pos);
      mesh.userData = { nodeId: node.id, label: node.label };
      scene.add(mesh);
      nodeMeshes.set(node.id, mesh);
    });

    // Focus camera on focus node
    const focusPos = nodePositions.get(focusId);
    if (focusPos) {
      ref.camera.position.set(focusPos.x + 10, focusPos.y + 5, focusPos.z + 15);
      ref.controls.target.copy(focusPos);
      ref.controls.update();
    }
  }, [nodes, links, focusId]);

  useEffect(() => {
    initScene();
    buildGraph();

    const ref = sceneRef.current;
    if (!ref) return;

    const animate = () => {
      ref.frameId = requestAnimationFrame(animate);
      ref.controls.update();
      ref.renderer.render(ref.scene, ref.camera);
    };
    animate();

    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !ref) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      ref.camera.aspect = w / h;
      ref.camera.updateProjectionMatrix();
      ref.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Click handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleClick = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container || !ref) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, ref.camera);
      const intersects = raycaster.intersectObjects(Array.from(ref.nodeMeshes.values()));
      if (intersects.length > 0) {
        const nodeId = intersects[0].object.userData.nodeId;
        if (nodeId && onNodeClick) onNodeClick(nodeId);
      }
    };
    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener('click', handleClick);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      const container = containerRef.current;
      if (container) {
        container.removeEventListener('click', handleClick);
      }
      cancelAnimationFrame(ref.frameId);
      ref.renderer.dispose();
      ref.scene.clear();
      if (container && ref.renderer.domElement.parentElement === container) {
        container.removeChild(ref.renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, [initScene, buildGraph, onNodeClick]);

  if (nodes.length === 0) {
    return (
      <div className="three-graph three-graph--empty">
        <p>{t('meta.noGraphData')}</p>
      </div>
    );
  }

  return (
    <div className="three-graph">
      <div ref={containerRef} className="three-graph-canvas" style={{ width: '100%', height: 520 }} />
      <div className="three-graph-hint">{t('meta.hint')}</div>
    </div>
  );
}
