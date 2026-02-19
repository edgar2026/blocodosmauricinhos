import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Participant } from './supabase';

// Amplia o tipo jsPDF para incluir autoTable
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

/**
 * Gera um nome de arquivo padronizado com a data atual
 */
const getFileName = (format: string) => {
    const date = new Date().toISOString().split('T')[0];
    return `relatorio-ponto-coleta-${date}.${format}`;
};

/**
 * Exporta os dados para PDF
 */
export const exportToPDF = (data: Participant[]) => {
    // Usar orientação paisagem (landscape) para caber mais colunas
    const doc = new jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    doc.setFontSize(22);
    doc.setTextColor(0, 65, 182); // Azul Uninassau
    doc.text('Relatório Completo - Ponto de Coleta', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${dateStr} às ${timeStr} | Total de Registros: ${data.length}`, 14, 28);

    const tableData = data.map(p => [
        p.name,
        p.cpf,
        p.user_type || 'Aluno(a)',
        p.unit,
        p.email,
        p.phone,
        p.bracelet_delivered ? 'ENTREGUE' : 'PENDENTE',
        p.bracelet_delivered ? (p.food_type || '-') : '-',
        p.bracelet_delivered ? `${p.food_kg}kg` : '-'
    ]);

    doc.autoTable({
        startY: 35,
        head: [['Folião', 'CPF', 'Perfil', 'Unidade', 'E-mail', 'WhatsApp', 'Status', 'Alimento', 'Peso']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [0, 65, 182],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 8,
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 50 }, // Nome
            1: { cellWidth: 30 }, // CPF
            4: { cellWidth: 45 }, // Email
            6: { halign: 'center' }, // Status
            8: { halign: 'center' }  // Peso
        },
        alternateRowStyles: { fillColor: [240, 242, 245] },
        margin: { top: 35, left: 10, right: 10 },
    });

    doc.save(getFileName('pdf'));
};

/**
 * Exporta os dados para Excel (.xlsx)
 */
export const exportToExcel = (data: Participant[]) => {
    const workbook = XLSX.utils.book_new();

    const excelData = data.map(p => ({
        'Folião': p.name,
        'CPF': p.cpf,
        'Perfil': p.user_type || 'Aluno(a)',
        'Unidade': p.unit,
        'E-mail': p.email,
        'WhatsApp': p.phone,
        'Status': p.bracelet_delivered ? 'Entregue' : 'Pendente',
        'Alimento Coletado': p.bracelet_delivered ? (p.food_type || 'Não Informado') : '-',
        'Peso (KG)': p.bracelet_delivered ? p.food_kg : 0,
        'Data da Entrega': p.delivery_at ? new Date(p.delivery_at).toLocaleString('pt-BR') : '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Ajuste de largura das colunas
    const wscols = [
        { wch: 40 }, // Folião
        { wch: 20 }, // CPF
        { wch: 20 }, // Perfil
        { wch: 15 }, // Unidade
        { wch: 35 }, // E-mail
        { wch: 20 }, // WhatsApp
        { wch: 15 }, // Status
        { wch: 20 }, // Alimento
        { wch: 12 }, // Peso
        { wch: 20 }, // Data Entrega
    ];
    worksheet['!cols'] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Completo');
    XLSX.writeFile(workbook, getFileName('xlsx'));
};
