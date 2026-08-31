/**
 * DiffTable — сравнительная таблица дифференциального диагноза
 *
 * Рендерит таблицу из MetaComparison: заголовки + строки с признаками.
 */

import type { MetaComparison } from '../types';

interface DiffTableProps {
  data: MetaComparison;
}

export function DiffTable({ data }: DiffTableProps) {
  const { headers, rows } = data;

  if (!headers.length || !rows.length) {
    return (
      <div className="diff-table diff-table--empty">
        <p>Сравнительные данные отсутствуют</p>
      </div>
    );
  }

  // Определяем ключи для ячеек (исключая колонку "feature")
  const valueKeys = Object.keys(rows[0]).filter((k) => k !== 'feature');

  return (
    <div className="diff-table-wrapper">
      <table className="diff-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={i === 0 ? 'diff-table-feature' : 'diff-table-value'}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="diff-table-feature">
                <strong>{row.feature}</strong>
              </td>
              {valueKeys.map((key, j) => (
                <td key={j} className="diff-table-value">
                  {row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
