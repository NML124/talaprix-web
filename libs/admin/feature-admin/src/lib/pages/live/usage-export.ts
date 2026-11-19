import { actionLabel, screenLabel, platformLabel } from './usage-labels';
import { rankings, type UsageReport } from './usage-report.model';

export async function exportReport(
  r: UsageReport,
  format: 'pdf' | 'xlsx',
  journal: readonly {
    at: string;
    user: string;
    actor_key: string;
    action: string;
    subject: string;
    screen: string | null;
    platform: string | null;
  }[] = [],
) {
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
  const actions = rankings(r)[0].rows;
  const countFor = (label: string) =>
    r.platforms.reduce(
      (sum, row) => sum + (platformLabel(row.label) === label ? row.count : 0),
      0,
    );
  const sets: {
    title: string;
    columns: string[];
    rows: (string | number)[][];
  }[] = [
    {
      title: 'Lecture du rapport',
      columns: ['Sujet', 'Interprétation'],
      rows: [
        [
          'Périmètre',
          r.truncated
            ? 'Les répartitions portent sur les ' +
              r.captured_events +
              ' événements les plus récents parmi ' +
              r.total_events +
              ' enregistrés sur la période.'
            : 'Le rapport couvre les ' +
              r.captured_events +
              ' événements enregistrés sur la période.',
        ],
        [
          'App mobile',
          countFor('App mobile') +
            ' événements analysés. Chaque recherche, consultation ou autre interaction suivie peut compter séparément.',
        ],
        [
          'App web',
          countFor('App web') +
            ' événements analysés. Le site mesure les pages consultées après accord du visiteur. Une absence de mesure ne permet pas de conclure à une absence de visites.',
        ],
        [
          'Action la plus fréquente',
          actions.length
            ? actions[0].label + ' (' + actions[0].count + ' événements).'
            : 'Aucune action enregistrée.',
        ],
        [
          'Sessions et comptes',
          'Une session regroupe plusieurs actions. Un même compte peut ouvrir plusieurs sessions. Les visites anonymes contribuent aux actions et aux sessions.',
        ],
        [
          'Zones et produits',
          'Ces classements comptent les événements associés à une zone ou à un produit renseigné. Les totaux peuvent donc être inférieurs au nombre d’événements analysés.',
        ],
      ],
    },
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
  if (format === 'xlsx') {
    const counts = new Map<
      string,
      { user: string; action: string; subject: string; count: number }
    >();
    for (const row of journal) {
      const action = actionLabel(row.action),
        subject = row.subject || '—';
      const key = JSON.stringify([row.actor_key, action, subject]);
      const existing = counts.get(key);
      if (existing) existing.count++;
      else counts.set(key, { user: row.user, action, subject, count: 1 });
    }
    sets.push(
      {
        title: 'Journal des actions',
        columns: [
          'Date et heure (Kinshasa)',
          'Utilisateur ou visiteur',
          'Action',
          'Produit ou détail',
          'Écran',
          'Plateforme',
        ],
        rows: journal.map((row) => [
          new Intl.DateTimeFormat('fr-CD', {
            dateStyle: 'short',
            timeStyle: 'medium',
            timeZone: 'Africa/Kinshasa',
          }).format(new Date(row.at)),
          row.user,
          actionLabel(row.action),
          row.subject || '—',
          screenLabel(row.screen),
          platformLabel(row.platform),
        ]),
      },
      {
        title: 'Actions par utilisateur',
        columns: [
          'Utilisateur ou visiteur',
          'Action',
          'Produit ou détail',
          'Nombre',
        ],
        rows: [...counts.values()]
          .sort((a, b) => b.count - a.count)
          .map((row) => [row.user, row.action, row.subject, row.count]),
      },
    );
  }
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
      if (section.title === 'Journal des actions') {
        col.width = [25, 30, 38, 44, 25, 20][i] ?? 20;
        return;
      }
      if (section.title === 'Actions par utilisateur') {
        col.width = [30, 38, 44, 14][i] ?? 20;
        return;
      }
      col.width =
        section.title === 'Lecture du rapport'
          ? i === 0
            ? 29
            : 82
          : i === 0
            ? 54
            : 18;
    });
    for (let i = 5; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      if (section.title === 'Lecture du rapport') {
        row.getCell(2).alignment = { wrapText: true, vertical: 'middle' };
        row.height = 48;
      }
      row.getCell(1).alignment = { wrapText: true };
      if (
        section.title === 'Journal des actions' ||
        section.title === 'Actions par utilisateur'
      ) {
        row.eachCell(
          (cell) => (cell.alignment = { vertical: 'middle', wrapText: true }),
        );
      }
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
