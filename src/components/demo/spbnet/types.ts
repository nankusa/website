declare global {
  interface Window {
    $3Dmol: any
    nj: any
  }
  interface HTMLDivElement {
    viewer?: any
  }
}

export interface ModalData {
  xyz: string
  energy: any
  attns: Record<string, number[]>
}
