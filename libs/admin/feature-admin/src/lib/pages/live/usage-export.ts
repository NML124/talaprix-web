import { rankings, type UsageReport } from './usage-report.model';

export async function exportReport(r: UsageReport, format: 'pdf' | 'xlsx') {
  const date = (iso: string) =>
    new Intl.DateTimeFormat('fr-CD', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(iso));
  const period =
    r.since && r.until
      ? date(r.since) + ' — ' + date(r.until) + ' UTC'
      : r.period_days + ' derniers jours';
  const filename =
    'TalaPrix-utilisation-' + (r.until?.slice(0, 10) ?? 'rapport');
  const sets: {
    title: string;
    columns: string[];
    rows: (string | number)[][];
  }[] = [
    {
      title: 'Synthèse',
      columns: ['Indicateur', 'Valeur'],
      rows: [
        ['Événements enregistrés', r.total_events],
        ['Événements analysés', r.captured_events],
        ['Sessions distinctes analysées', r.active_sessions],
        ['Comptes actifs analysés', r.signed_in_users],
      ],
    },
    {
      title: 'Activité quotidienne',
      columns: ['Date UTC', 'Événements', 'Sessions', 'Comptes'],
      rows: r.daily.map((d) => [d.date, d.events, d.sessions, d.users]),
    },
    ...rankings(r).map((g) => ({
      title: g.title,
      columns: ['Libellé', 'Événements'],
      rows: g.rows.map((v) => [v.label, v.count]),
    })),
  ];
  if (format === 'pdf') {
    const [{ jsPDF }, { default: table }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const pdf = new jsPDF();
    let y = 36;
    for (const section of sets) {
      if (y > 240) {
        pdf.addPage();
        y = 24;
      }
      pdf.setTextColor(17, 56, 54);
      pdf.setFontSize(13);
      pdf.text(section.title, 14, y);
      table(pdf, {
        startY: y + 4,
        head: [section.columns],
        body: section.rows.length ? section.rows : [['Aucune donnée']],
        margin: { top: 25, bottom: 18 },
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 2.5 },
        headStyles: { fillColor: [0, 109, 98] },
        alternateRowStyles: { fillColor: [241, 247, 246] },
      });
      y =
        (pdf as typeof pdf & { lastAutoTable: { finalY: number } })
          .lastAutoTable.finalY + 14;
    }
    const pages = pdf.getNumberOfPages();
    for (let n = 1; n <= pages; n++) {
      pdf.setPage(n);
      pdf.setFontSize(11);
      pdf.setTextColor(0, 97, 89);
      pdf.text('TalaPrix   /   Utilisation', 14, 11);
      pdf.setFontSize(8);
      pdf.text(period, 14, 17);
      pdf.text('Administration   |   ' + n + ' / ' + pages, 14, 289);
    }
    pdf.save(filename + '.pdf');
    return;
  }
  const { Workbook } = await import('exceljs');
  const workbook = new Workbook();
  workbook.creator = 'TalaPrix';
  for (const section of sets) {
    const sheet = workbook.addWorksheet(section.title, {
      views: [{ state: 'frozen', ySplit: 4 }],
    });
    sheet.addRow(['TalaPrix  /  ' + section.title]);
    sheet.mergeCells(1, 1, 1, section.columns.length);
    sheet.getRow(1).height = 29;
    sheet.getCell('A1').font = {
      bold: true,
      size: 16,
      color: { argb: 'FFFFFFFF' },
    };
    sheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10544F' },
    };
    sheet.addRow([period]);
    sheet.mergeCells(2, 1, 2, section.columns.length);
    sheet.addRow([]);
    const heading = sheet.addRow(section.columns);
    heading.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF087A70' },
      };
    });
    sheet.addRows(section.rows);
    sheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: section.columns.length },
    };
    sheet.columns.forEach((col, i) => {
      col.width = i === 0 ? 54 : 18;
    });
    for (let i = 5; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      row.getCell(1).alignment = { wrapText: true };
      if (i % 2 === 0)
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF1F7F6' },
          };
        });
    }
  }
  const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
  const url = URL.createObjectURL(
    new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '.xlsx';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
