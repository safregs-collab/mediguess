#!/usr/bin/env node
import { Command } from 'commander';
import { extractPdf } from './pdfExtractor';
import { parseCrNlp } from './nlpParser';
import { buildCrJson } from './crBuilder';
import fs from 'fs/promises';
import path from 'path';

const program = new Command();

program
  .name('cr-parser')
  .description('Parse Russian Clinical Recommendations PDF to JSON')
  .version('1.0.0');

program
  .requiredOption('--pdf <path>', 'Path to PDF file')
  .requiredOption('--number <n>', 'CR number', parseInt)
  .option('--version <v>', 'CR version', '1')
  .option('--specialty <s>', 'Medical specialty', 'general')
  .option('--url <url>', 'Source URL', '')
  .option('--output <dir>', 'Output directory', '../../public/data')
  .action(async (options) => {
    try {
      console.log(`[CR-Parser] Extracting ${options.pdf}...`);
      const extracted = await extractPdf(options.pdf);
      
      console.log(`[CR-Parser] Parsing NLP...`);
      const parsed = parseCrNlp(extracted);
      
      console.log(`[CR-Parser] Building JSON...`);
      const cr = buildCrJson(
        options.number,
        parseInt(options.version),
        extracted.title,
        extracted.mkb10,
        options.specialty,
        parsed,
        options.url
      );
      
      const outputPath = path.resolve(options.output, `cr-${options.number}-v${options.version}.json`);
      await fs.writeFile(outputPath, JSON.stringify(cr, null, 2));
      
      console.log(`[CR-Parser] Saved to ${outputPath}`);
      console.log(`  Title: ${cr.title}`);
      console.log(`  MKB-10: ${cr.mkb10.join(', ')}`);
      console.log(`  Complaints: ${cr.clinicalPicture.complaints.length}`);
      console.log(`  Lab tests: ${cr.diagnostics.lab.length}`);
      console.log(`  Treatment steps: ${cr.treatment.emergency.length + cr.treatment.therapy.length + cr.treatment.surgery.length}`);
    } catch (error) {
      console.error('[CR-Parser] Error:', error);
      process.exit(1);
    }
  });

program.parse();
