export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Falha ao ler o arquivo de imagem."));
      }
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Erro ao ler o arquivo de imagem."));
    };

    reader.readAsDataURL(file);
  });
}
