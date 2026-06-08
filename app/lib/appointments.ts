export type Appointment = {
  slug: string;
  status: string;
  date: string;
  compactDate: string;
  title: string;
  location: string;
  address: string;
  time: string;
  organizer: string;
  organizerRole: string;
  tags: string[];
  category: string;
  shortDescription: string;
  summary: string;
  image: string;
};

export const events = [
  {
    slug: "oficina-de-compostagem-organica",
    status: "Confirmado",
    date: "14 de outubro, 2026",
    compactDate: "14 de Outubro - 14:00",
    title: "Oficina de Compostagem Orgânica",
    location: "Horta Comunitária UFRPE",
    address: "Recife, PE - Departamento de Agronomia",
    time: "Quarta-feira, 14 de Outubro às 14:00",
    organizer: "Profa. Helena Silva",
    organizerRole: "Departamento de Agronomia, UFRPE",
    tags: ["Sustentabilidade", "Workshop presencial"],
    category: "Oficina",
    shortDescription:
      "Aprenda a transformar resíduos orgânicos em adubo rico para suas plantas. Simples, prático e sustentável.",
    summary:
      "Aprenda a transformar resíduos orgânicos em adubo rico para seus projetos acadêmicos e horta doméstica. Uma iniciativa para fortalecer o ecossistema circular da UFRPE. Os participantes terão a oportunidade de colocar a mão na massa e entender os processos biológicos por trás de uma compostagem eficiente.",
    image:
      "https://images.unsplash.com/photo-1605411519011-9c96d455ee74?auto=format&fit=crop&w=1100&q=85",
  },
  {
    slug: "mutirao-de-reflorestamento-local",
    status: "Confirmado",
    date: "19 de outubro, 2026",
    compactDate: "19 de Outubro - 08:30",
    title: "Mutirão de Reflorestamento Local",
    location: "Reserva Florestal Capeca",
    address: "Recife, PE - Área de conservação da UFRPE",
    time: "Segunda-feira, 19 de Outubro às 08:30",
    organizer: "Prof. Marcos Araújo",
    organizerRole: "Núcleo de Estudos Ambientais, UFRPE",
    tags: ["Reflorestamento", "Atividade de campo"],
    category: "Mutirão",
    shortDescription:
      "Ajude a revitalizar a área verde do Campus Dois Irmãos. Uma manhã dedicada ao contato com a terra e biodiversidade.",
    summary:
      "Participe do plantio de mudas nativas e contribua para a recuperação de áreas verdes próximas ao campus. A atividade inclui orientação técnica, identificação de espécies e práticas de manejo para aumentar a sobrevivência das mudas.",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1100&q=85",
  },
  {
    slug: "coleta-seletiva-inteligente",
    status: "Confirmado",
    date: "23 de outubro, 2026",
    compactDate: "23 de Outubro - 10:00",
    title: "Coleta Seletiva Inteligente",
    location: "Pátio Central - Prédio Central",
    address: "Recife, PE - Campus Sede UFRPE",
    time: "Sexta-feira, 23 de Outubro às 10:00",
    organizer: "Equipe SustentaRural",
    organizerRole: "Programa de Sustentabilidade, UFRPE",
    tags: ["Reciclagem", "Tecnologia verde"],
    category: "Ecologia",
    shortDescription:
      "Conheça ferramentas e práticas para melhorar a separação de resíduos no campus.",
    summary:
      "Conheça uma ação prática de coleta seletiva com apoio de indicadores, pontos de descarte e orientação sobre separação correta de resíduos. A proposta aproxima tecnologia e educação ambiental no cotidiano do campus.",
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1100&q=85",
  },
  {
    slug: "feira-de-organicos",
    status: "Disponível",
    date: "26 de outubro, 2026",
    compactDate: "26 de Outubro - 09:00",
    title: "Feira de Orgânicos",
    location: "Praça do CEGOE",
    address: "Recife, PE - Campus Sede UFRPE",
    time: "Segunda-feira, 26 de Outubro às 09:00",
    organizer: "Coletivo Agroecológico UFRPE",
    organizerRole: "Rede de produtores parceiros",
    tags: ["Feira", "Agroecologia"],
    category: "Feira",
    shortDescription:
      "Conecte-se com produtores locais e garanta alimentos frescos e livres de agrotóxicos diretamente no campus.",
    summary:
      "A Feira de Orgânicos aproxima estudantes, servidores e produtores locais em uma manhã dedicada a alimentação saudável. Além da compra direta, os participantes conhecem iniciativas de agricultura familiar e práticas de consumo consciente.",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1100&q=85",
  },
  {
    slug: "pedal-sustentarural",
    status: "Disponível",
    date: "30 de outubro, 2026",
    compactDate: "Todo Sábado - 07:00",
    title: "Pedal SustentaRural",
    location: "Portão Principal da UFRPE",
    address: "Recife, PE - Campus Sede UFRPE",
    time: "Todo sábado às 07:00",
    organizer: "Grupo Bike Campus",
    organizerRole: "Comunidade SustentaRural",
    tags: ["Mobilidade", "Esporte"],
    category: "Mobilidade",
    shortDescription:
      "Promova a mobilidade ativa participando do nosso passeio ciclístico semanal. Conheça as trilhas ecológicas da UFRPE.",
    summary:
      "O Pedal SustentaRural incentiva deslocamentos saudáveis e reduzidos em carbono. O roteiro passa por áreas arborizadas do campus, com pausas para hidratação, orientações de segurança e conversa sobre mobilidade sustentável.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=85",
  },
  {
    slug: "manejo-de-horta-agroecologica",
    status: "Disponível",
    date: "5 de novembro, 2026",
    compactDate: "5 de Novembro - 08:00",
    title: "Manejo de Horta Agroecológica",
    location: "Horta Experimental UFRPE",
    address: "Recife, PE - Departamento de Agronomia",
    time: "Quinta-feira, 5 de Novembro às 08:00",
    organizer: "Laboratório de Agroecologia",
    organizerRole: "Departamento de Agronomia, UFRPE",
    tags: ["Horta", "Agroecologia"],
    category: "Oficina",
    shortDescription:
      "Aprenda técnicas de manejo, irrigação e consórcio de culturas para hortas de pequeno porte.",
    summary:
      "Uma atividade prática para quem deseja cultivar alimentos em pequenos espaços. O encontro aborda preparo de canteiros, cobertura do solo, consórcio de espécies e cuidados de rotina para manter uma horta produtiva.",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1100&q=85",
  },
] as const satisfies readonly Appointment[];

export const appointments = events.slice(0, 3);

export function findAppointment(slug: string) {
  return events.find((appointment) => appointment.slug === slug);
}


