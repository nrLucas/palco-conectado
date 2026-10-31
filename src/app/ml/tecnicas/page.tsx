import { FileViewer } from "@/components/ml/lab/FileViewer";
import { TechniqueReport } from "@/components/ml/lab/TechniqueReport";
import { LAB_FILE_LABELS, LAB_FILES } from "@/lib/ml/lab-catalog";
import Link from "next/link";

export default function MlTechniquesPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <header className="max-w-3xl">
        <Link href="/ml" className="text-accent text-sm font-medium">
          Voltar ao laboratório
        </Link>
        <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight">Técnicas e arquivos</h1>
        <div className="text-muted mt-4 max-w-[65ch] space-y-3 text-sm leading-relaxed">
          <p>
            O laboratório estima o cachê de um show e a chance de cada lado aceitar. A casa pode
            oferecer um valor, ou a banda pode pedir um. O histórico tem 800 talentos e 6.000
            propostas, semente 42. Cachê, orçamento e aceite são simulados; 411 nomes vieram de
            buscas no Spotify.
          </p>
          <p>
            A data escolhida define o dia. Dia de semana não encarece o cachê. Sexta sobe um pouco,
            domingo fica no meio e sábado é o mais alto. Se a mesma casa já tem propostas naquela
            data, a chance cai nos dois lados. Quando a casa oferece acima do cachê, a banda aceita
            com mais facilidade. Quando a banda pede acima do cachê, e ainda mais acima do orçamento,
            a casa recusa.
          </p>
          <p>
            Há duas logísticas. A primeira aprendeu se a banda aceita a oferta. A segunda, nas mesmas
            6.000 propostas, aprendeu se a casa aceita o pedido. O ranking de pares continua usando só
            a chance de a banda aceitar.
          </p>
          <p>
            Quando a busca no Spotify funciona, parte dos talentos usa o nome de artistas reais.
            O objeto do artista não trouxe gênero nem popularidade, então o gênero é o da busca que
            encontrou o artista e a popularidade continua simulada. Integrantes, cachê, orçamento e
            aceite também não vêm da API. O modelo anterior, os gráficos e os CSV ficam em backup.
          </p>
        </div>
      </header>

      <TechniqueReport />

      <FileViewer
        files={(Object.keys(LAB_FILES) as Array<keyof typeof LAB_FILES>).map((id) => ({
          id,
          label: LAB_FILE_LABELS[id],
        }))}
      />
    </main>
  );
}
