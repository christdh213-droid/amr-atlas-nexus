import type { ResistanceGene } from '../types/amr';

// Single source of truth mapping each seed gene symbol to its ResistanceGene metadata
export const GENE_REFERENCE: Record<string, ResistanceGene> = {
  'blaNDM-1': {
    gene_symbol: 'blaNDM-1',
    gene_class: 'BETA-LACTAM',
    source_accession: 'NG_049326.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_049326.1',
  },
  'blaKPC-2': {
    gene_symbol: 'blaKPC-2',
    gene_class: 'BETA-LACTAM',
    source_accession: 'NG_049253.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_049253.1',
  },
  'blaOXA-48': {
    gene_symbol: 'blaOXA-48',
    gene_class: 'BETA-LACTAM',
    source_accession: 'NG_049762.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_049762.1',
  },
  'blaCTX-M-15': {
    gene_symbol: 'blaCTX-M-15',
    gene_class: 'BETA-LACTAM',
    source_accession: 'NG_048935.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_048935.1',
  },
  'blaTEM-1': {
    gene_symbol: 'blaTEM-1',
    gene_class: 'BETA-LACTAM',
    source_accession: 'NG_050145.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_050145.1',
  },
  'blaSHV-12': {
    gene_symbol: 'blaSHV-12',
    gene_class: 'BETA-LACTAM',
    source_accession: 'NG_049956.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_049956.1',
  },
  'mcr-1.1': {
    gene_symbol: 'mcr-1.1',
    gene_class: 'COLISTIN',
    source_accession: 'NG_050417.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_050417.1',
  },
  "aac(6')-Ib-cr5": {
    gene_symbol: "aac(6')-Ib-cr5",
    gene_class: 'AMINOGLYCOSIDE/QUINOLONE',
    source_accession: 'NG_051497.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_051497.1',
  },
  'qnrS1': {
    gene_symbol: 'qnrS1',
    gene_class: 'QUINOLONE',
    source_accession: 'NG_050543.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_050543.1',
  },
  'tet(A)': {
    gene_symbol: 'tet(A)',
    gene_class: 'TETRACYCLINE',
    source_accession: 'NG_048195.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_048195.1',
  },
  'sul1': {
    gene_symbol: 'sul1',
    gene_class: 'SULFONAMIDE',
    source_accession: 'NG_048082.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_048082.1',
  },
};
