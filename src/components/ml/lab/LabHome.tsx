"use client";

import { EventDatePicker } from "@/components/shared/EventDatePicker";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { useBands, useEstablishments, useSearchMusicians } from "@/lib/hooks";
import { fetchRecommendations, fetchSimilarProfiles, type RecommendationMatch, type SimilarProfile } from "@/lib/api/ml";
import { dayKindLabel } from "@/lib/ml/features";
import { Button, Input, Label, NumberField as CurrencyField, Radio, RadioGroup, TextField } from "@heroui/react";
import { getLocalTimeZone, parseDate, type DateValue } from "@internationalized/date";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ComponentProps } from "react";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

type Score = { mae: number; rmse: number; r2: number };
type ClassScore = {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
};

type LabMetrics = {
  seed: number;
  proposals: number;
  talents: number;
  acceptanceRate: number;
  regression: { linear: Score; randomForest: Score };
  classification: { logistic: ClassScore; randomForest: ClassScore };
  clustering: {
    k: number;
    silhouette: number;
    adjustedRandVsLatentSegment: number;
  };
  notes: string[];
};

type LabOptions = {
  genres: string[];
  establishmentTypes: string[];
  cities: string[];
  experiences: Array<{ id: number; label: string }>;
};

type PlayResult = {
  suggestedAmount: number;
  acceptanceProbability: number;
  acceptanceLabel: "alta" | "media" | "baixa";
  clusterName: string;
  distance: number;
};

const ACCEPTANCE_COPY = { alta: "alta", media: "média", baixa: "baixa" } as const;

function toIsoDate(value: DateValue): string {
  const eventDate = value.toDate(getLocalTimeZone());
  const month = String(eventDate.getMonth() + 1).padStart(2, "0");
  const day = String(eventDate.getDate()).padStart(2, "0");
  return `${eventDate.getFullYear()}-${month}-${day}`;
}

function decimal(value: number, digits = 2) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function LabHome() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<LabMetrics | null>(null);
  const [options, setOptions] = useState<LabOptions | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/ml/lab/metrics")
      .then((response) => {
        if (!response.ok) throw new Error("metrics");
        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        setMetrics(payload.metrics);
        setOptions(payload.options);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="container mx-auto px-4 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Laboratório de aprendizado</h1>
          <p className="text-muted mt-2 max-w-[65ch] text-sm leading-relaxed">
            Tela da disciplina, separada do marketplace. O treino leu{" "}
            {metrics
              ? `${metrics.proposals.toLocaleString("pt-BR")} propostas e ${metrics.talents.toLocaleString("pt-BR")} talentos, semente ${metrics.seed}`
              : "6.000 propostas e 800 talentos, semente 42"}
            : cachê, orçamento e aceite são simulados; 411 nomes vieram de buscas no Spotify. Cadastrar
            um perfil novo não retreina o modelo. O texto do treino e as métricas estão em Técnicas e arquivos.
          </p>
        </div>
        <Button className="button--hero" onPress={() => router.push("/ml/tecnicas")}>
          Ver técnicas e arquivos
        </Button>
      </header>

      {failed && <p className="text-danger mt-8 text-sm">Não foi possível ler as métricas do treino.</p>}

      {options && <Playground options={options} />}
    </main>
  );
}

function Playground({ options }: { options: LabOptions }) {
  const [genre, setGenre] = useState(options.genres[0] ?? "Rock");
  const [establishmentType, setEstablishmentType] = useState(options.establishmentTypes[0] ?? "Bar");
  const [capacity, setCapacity] = useState(150);
  const [members, setMembers] = useState(4);
  const [talentLocation, setTalentLocation] = useState(options.cities[0] ?? "São Paulo - SP");
  const [venueLocation, setVenueLocation] = useState(options.cities[0] ?? "São Paulo - SP");
  const [eventDate, setEventDate] = useState<DateValue | null>(parseDate("2026-12-18"));
  const [rating, setRating] = useState(4.8);
  const [shows, setShows] = useState(23);
  const [experience, setExperience] = useState(1);
  const [talentPrice, setTalentPrice] = useState("R$ 600 - R$ 1.200");
  const [venueBudget, setVenueBudget] = useState("R$ 900 - R$ 1.200");
  const [amount, setAmount] = useState(1500);
  const [dateLoad, setDateLoad] = useState(0);
  const [side, setSide] = useState<"house" | "talent">("house");
  const [play, setPlay] = useState<PlayResult | null>(null);
  const [playError, setPlayError] = useState(false);
  const eventIso = eventDate ? toIsoDate(eventDate) : "2026-12-18";

  useEffect(() => {
    const handle = setTimeout(() => {
      setPlayError(false);
      fetch("/api/ml/lab/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre,
          establishmentType,
          capacity,
          members,
          talentLocation,
          venueLocation,
          eventDate: eventIso,
          rating,
          shows,
          talentPrice,
          venueBudget,
          amount,
          experience,
          dateLoad,
          side,
        }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("play");
          return response.json();
        })
        .then(setPlay)
        .catch(() => setPlayError(true));
    }, 300);
    return () => clearTimeout(handle);
  }, [
    genre,
    establishmentType,
    capacity,
    members,
    talentLocation,
    venueLocation,
    eventIso,
    rating,
    shows,
    experience,
    talentPrice,
    venueBudget,
    amount,
    dateLoad,
    side,
  ]);

  const cityOptions = options.cities.map((city) => ({ id: city, label: city }));

  return (
    <div className="mt-10 space-y-8">
      <section className="rounded-[var(--radius)] border border-border bg-surface/40 p-5">
        <h2 className="font-display text-lg font-semibold">
          Previsão (Regressão) e Classificação (Aprendizado Supervisionado)
        </h2>
        <p className="text-muted mt-1 max-w-3xl text-sm">
          {side === "house"
            ? "A casa oferece um valor e a barra é a chance de a banda aceitar. O orçamento entra no cachê e não limita a oferta."
            : "A banda ou o músico pede um valor e a barra é a chance de a casa aceitar. Pedido acima do cachê e do orçamento derruba essa chance."}{" "}
          A data define sozinha se o dia é de semana, sexta, sábado ou domingo.
        </p>
        <RadioGroup
          aria-label="Quem envia a proposta"
          className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-6"
          value={side}
          onChange={(value) => setSide(value as "house" | "talent")}
        >
          <Radio value="house">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>A casa oferece</Radio.Content>
          </Radio>
          <Radio value="talent">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>A banda ou o músico pede</Radio.Content>
          </Radio>
        </RadioGroup>
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold">Dados da casa</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <LabeledSelect
                  label="Tipo da casa"
                  value={establishmentType}
                  onChange={setEstablishmentType}
                  options={options.establishmentTypes.map((item) => ({ id: item, label: item }))}
                />
                <LabeledSelect label="Cidade da casa" value={venueLocation} onChange={setVenueLocation} options={cityOptions} />
                <CountField id="lab-capacity" label="Capacidade" value={capacity} min={20} max={2000} onChange={setCapacity} />
                <TextField>
                  <Label htmlFor="lab-budget">Orçamento da casa</Label>
                  <Input id="lab-budget" value={venueBudget} onChange={(event) => setVenueBudget(event.target.value)} />
                </TextField>
                <EventDatePicker
                  label={`Data do evento · ${dayKindLabel(eventIso)}`}
                  value={eventDate}
                  onChange={setEventDate}
                />
                <div>
                  <Label htmlFor="lab-load">Propostas já nesta data: {dateLoad}</Label>
                  <input
                    id="lab-load"
                    className="mt-2 w-full accent-[var(--accent)]"
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    value={dateLoad}
                    onChange={(event) => setDateLoad(Number(event.target.value))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <CurrencyField
                    aria-label={side === "house" ? "Valor ofertado pela casa" : "Valor pedido pela banda"}
                    formatOptions={{ style: "currency", currency: "BRL" }}
                    minValue={200}
                    value={amount}
                    onChange={(value) => {
                      if (typeof value === "number" && Number.isFinite(value)) setAmount(Math.max(200, value));
                    }}
                  >
                    <Label>{side === "house" ? "Valor ofertado pela casa" : "Valor pedido pela banda"}</Label>
                    <CurrencyField.Group>
                      <CurrencyField.Input className="w-full" />
                    </CurrencyField.Group>
                  </CurrencyField>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Dados da banda ou do músico</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <LabeledSelect
                  label="Gênero"
                  value={genre}
                  onChange={setGenre}
                  options={options.genres.map((item) => ({ id: item, label: item }))}
                />
                <LabeledSelect label="Cidade" value={talentLocation} onChange={setTalentLocation} options={cityOptions} />
                <LabeledSelect
                  label="Experiência"
                  value={String(experience)}
                  onChange={(value) => setExperience(Number(value))}
                  options={options.experiences.map((item) => ({ id: String(item.id), label: item.label }))}
                />
                <CountField id="lab-members" label="Integrantes" value={members} min={1} max={12} onChange={setMembers} />
                <CountField id="lab-shows" label="Shows realizados" value={shows} min={0} max={200} onChange={setShows} />
                <div>
                  <Label htmlFor="lab-rating">Nota {rating.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</Label>
                  <input
                    id="lab-rating"
                    className="mt-2 w-full accent-[var(--accent)]"
                    type="range"
                    min={1}
                    max={5}
                    step={0.1}
                    value={rating}
                    onChange={(event) => setRating(Number(event.target.value))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <TextField>
                    <Label htmlFor="lab-price">Faixa de preço</Label>
                    <Input id="lab-price" value={talentPrice} onChange={(event) => setTalentPrice(event.target.value)} />
                  </TextField>
                </div>
              </div>
            </div>
          </div>
          <PlayResultCard result={play} failed={playError} amount={amount} side={side} />
        </div>
      </section>

      <ClusterCatalog />
      <RecommendationCatalog />
    </div>
  );
}

function LabeledSelect(props: ComponentProps<typeof FilterSelect>) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium">{props.label}</p>
      <FilterSelect {...props} />
    </div>
  );
}

function CountField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <TextField>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={String(value)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </TextField>
  );
}

function PlayResultCard({
  result,
  failed,
  amount,
  side,
}: {
  result: PlayResult | null;
  failed: boolean;
  amount: number;
  side: "house" | "talent";
}) {
  if (failed) return <p className="text-danger text-sm">Não foi possível calcular este cenário.</p>;
  if (!result) return <p className="text-muted text-sm">Calculando…</p>;
  const percent = Math.round(result.acceptanceProbability * 100);
  const ratio = amount / Math.max(result.suggestedAmount, 1);
  const ratioLabel = ratio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const offerSentence =
    side === "house"
      ? ratio >= 1.02
        ? "Oferta acima do cachê sobe a chance de a banda aceitar."
        : ratio <= 0.98
          ? "Oferta abaixo do cachê derruba a chance de a banda aceitar."
          : "Oferta perto do cachê. A chance já fica alta e sobe se a casa oferecer mais."
      : ratio >= 1.02
        ? "Pedido acima do cachê derruba a chance de a casa aceitar."
        : ratio <= 0.98
          ? "Pedido abaixo do cachê sobe a chance de a casa aceitar."
          : "Pedido perto do cachê. A chance da casa já fica alta e cai se a banda pedir mais.";
  return (
    <div className="rounded-[var(--radius)] border border-accent/30 bg-accent/5 p-4">
      <p className="text-muted text-xs">Cachê sugerido</p>
      <p className="font-display mt-1 text-2xl font-semibold tabular-nums">{currency.format(result.suggestedAmount)}</p>
      <p className="text-muted mt-2 text-sm">
        {side === "house" ? "Razão oferta/cachê" : "Razão pedido/cachê"} {ratioLabel}
      </p>
      <p className="mt-1 text-sm leading-relaxed">{offerSentence}</p>
      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span>{side === "house" ? "Chance de a banda aceitar" : "Chance de a casa aceitar"}</span>
          <span className="font-medium tabular-nums">
            {percent}% · {ACCEPTANCE_COPY[result.acceptanceLabel]}
          </span>
        </div>
        <div className="bg-default mt-2 h-2 overflow-hidden rounded-full">
          <div className="bg-accent h-full" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <p className="mt-4 text-sm">
        Grupo do talento: <span className="font-medium">{result.clusterName}</span>
      </p>
      <p className="text-muted mt-1 text-xs">Distância ao centróide {decimal(result.distance, 2)}</p>
    </div>
  );
}

function ClusterCatalog() {
  const { data: bands = [] } = useBands();
  const { data: musicians = [] } = useSearchMusicians();
  const talents = [
    ...bands.map((band) => ({ id: `band:${band.id}`, kind: "band" as const, entityId: band.id, label: `${band.name} · banda` })),
    ...musicians.map((musician) => ({
      id: `musician:${musician.id}`,
      kind: "musician" as const,
      entityId: musician.id,
      label: `${musician.name} · músico`,
    })),
  ];
  const [selected, setSelected] = useState("");
  const [clusterName, setClusterName] = useState<string | null>(null);
  const [similar, setSimilar] = useState<SimilarProfile[]>([]);

  useEffect(() => {
    if (selected) return;
    if (bands[0]) setSelected(`band:${bands[0].id}`);
    else if (musicians[0]) setSelected(`musician:${musicians[0].id}`);
  }, [selected, bands, musicians]);

  useEffect(() => {
    const [kind, entityId] = selected.split(":");
    if ((kind !== "band" && kind !== "musician") || !entityId) return;
    let active = true;
    fetchSimilarProfiles(kind, entityId)
      .then((response) => {
        if (!active) return;
        setClusterName(response.clusterName);
        setSimilar(response.similar);
      })
      .catch(() => {
        if (!active) return;
        setClusterName(null);
        setSimilar([]);
      });
    return () => {
      active = false;
    };
  }, [selected]);

  return (
    <section className="rounded-[var(--radius)] border border-border bg-surface/40 p-5">
      <h2 className="font-display text-lg font-semibold">
        Agrupamento/Clusterização (Aprendizado não Supervisionado)
      </h2>
      <p className="text-muted mt-1 max-w-3xl text-sm">
        Escolha uma banda ou um músico já cadastrado. O K-Means aponta o centróide mais próximo e
        lista quem caiu no mesmo grupo. O cenário acima também mostra o grupo de um talento inventado.
      </p>
      {talents.length > 0 && (
        <div className="mt-4 max-w-md">
          <LabeledSelect label="Perfil do catálogo" value={selected} onChange={setSelected} options={talents.map((item) => ({ id: item.id, label: item.label }))} />
        </div>
      )}
      {clusterName && (
        <div className="mt-4">
          <p className="font-medium">{clusterName}</p>
          {similar.length === 0 ? (
            <p className="text-muted mt-2 text-sm">Nenhum outro perfil caiu neste grupo.</p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {similar.map((profile) => (
                <li key={`${profile.kind}-${profile.id}`} className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm">
                  <span className="font-medium">{profile.name}</span>
                  <span className="text-muted mt-1 block">
                    {profile.genre} · {profile.location}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function RecommendationCatalog() {
  const { data: bands = [] } = useBands();
  const { data: establishments = [] } = useEstablishments();
  const [kind, setKind] = useState<"band" | "establishment">("band");
  const options =
    kind === "band"
      ? bands.map((band) => ({ id: band.id, label: band.name }))
      : establishments.map((place) => ({ id: place.id, label: place.name }));
  const [selected, setSelected] = useState("");
  const [items, setItems] = useState<RecommendationMatch[]>([]);
  const [referenceDate, setReferenceDate] = useState<string | null>(null);

  useEffect(() => {
    if (!options.some((item) => item.id === selected) && options[0]) setSelected(options[0].id);
  }, [options, selected]);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    fetchRecommendations(kind, selected)
      .then((response) => {
        if (!active) return;
        setItems(response.items);
        setReferenceDate(response.referenceDate);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
        setReferenceDate(null);
      });
    return () => {
      active = false;
    };
  }, [kind, selected]);

  return (
    <section className="rounded-[var(--radius)] border border-border bg-surface/40 p-5">
      <h2 className="font-display text-lg font-semibold">Recomendação de pares</h2>
      <p className="text-muted mt-1 max-w-3xl text-sm">
        O ranking mistura 70% da chance da logística com 30% do histórico de aceite. A oferta de
        referência é a próxima sexta com pelo menos 21 dias
        {referenceDate ? `, ${formatDate(referenceDate)}` : ""}.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <LabeledSelect
          label="Quem está pedindo"
          value={kind}
          onChange={(value) => {
            setKind(value === "establishment" ? "establishment" : "band");
            setSelected("");
          }}
          options={[
            { id: "band", label: "Uma banda procura casas" },
            { id: "establishment", label: "Uma casa procura bandas" },
          ]}
        />
        {options.length > 0 && (
          <LabeledSelect label="Perfil" value={selected} onChange={setSelected} options={options} />
        )}
      </div>
      <ul className="mt-4 grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-[var(--radius)] border border-border bg-background px-4 py-3">
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-medium">{item.name}</span>
              <span className="font-display text-lg font-semibold tabular-nums">{Math.round(item.score * 100)}%</span>
            </span>
            <span className="text-muted mt-1 block text-sm">
              {item.detail} · {item.location} · cachê {currency.format(item.suggestedAmount)}
            </span>
            <span className="mt-1 block text-sm">{item.reasons.join(" · ")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}
