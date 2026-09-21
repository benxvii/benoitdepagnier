import { useState, type FormEvent } from "react";
import { geocodeAddress } from "../../lib/geocode";
import { cn } from "../../lib/cn";
import type { PoiItem } from "./Poi";

interface PoiFormPosition {
  lat: number;
  lng: number;
}

interface PoiFormData {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  url: string;
  comment: string;
  category: string[];
  amenities: string[];
  visibility: "public" | "private";
  tier: "gratuit" | "payant" | "abonne";
  lat: number;
  lng: number;
}

interface PoiFormProps {
  position: PoiFormPosition | null;
  onPositionChange: (position: PoiFormPosition) => void;
  onSubmit: (data: PoiFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Omit<PoiItem, "id" | "owner_id" | "created_at">;
  submitLabel?: string;
}

const categoryOptions: { value: string; label: string }[] = [
  { value: "coworking", label: "Coworking" },
  { value: "cafe_sympa", label: "Café sympa" },
  { value: "bibliotheque", label: "Bibliothèque" },
  { value: "universite", label: "Université" },
  { value: "terrasse_exterieur", label: "Terrasse / extérieur" },
  { value: "hotel_coworking", label: "Hôtel avec coworking" },
  { value: "salle_reunion", label: "Salle de réunion" },
];

const amenityOptions: { value: string; label: string }[] = [
  { value: "wifi", label: "Wifi" },
  { value: "prises_electriques", label: "Prises électriques" },
  { value: "calme", label: "Calme" },
  { value: "parking", label: "Parking" },
  { value: "accessible_pmr", label: "Accessible PMR" },
  { value: "ouvert_weekend", label: "Ouvert le weekend" },
];

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export default function PoiForm({
  position,
  onPositionChange,
  onSubmit,
  onCancel,
  initialData,
  submitLabel = "Ajouter le point",
}: PoiFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [postalCode, setPostalCode] = useState(
    initialData?.postal_code ?? "",
  );
  const [city, setCity] = useState(initialData?.city ?? "");
  const [url, setUrl] = useState(initialData?.url ?? "");
  const [comment, setComment] = useState(initialData?.comment ?? "");
  const [category, setCategory] = useState<string[]>(
    initialData?.category ?? [],
  );
  const [amenities, setAmenities] = useState<string[]>(
    initialData?.amenities ?? [],
  );
  const [visibility, setVisibility] = useState<"public" | "private">(
    initialData?.visibility ?? "public",
  );
  const [tier, setTier] = useState<"gratuit" | "payant" | "abonne">(
    initialData?.tier ?? "gratuit",
  );

  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = Boolean(position) && name.trim() !== "" && category.length > 0;

  const handleLocate = async () => {
    if (!address.trim()) return;
    setGeocoding(true);
    setGeocodeError(null);

    const result = await geocodeAddress(address);

    setGeocoding(false);
    if (!result) {
      setGeocodeError("Aucun résultat pour cette adresse.");
      return;
    }
    onPositionChange(result);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!position || !canSubmit) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        address: address.trim(),
        postal_code: postalCode.trim(),
        city: city.trim(),
        url: url.trim(),
        comment: comment.trim(),
        category,
        amenities,
        visibility,
        tier,
        lat: position.lat,
        lng: position.lng,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-100 rounded-lg p-6 mb-8">
      <h2 className="text-lg font-medium mb-4">Ajouter un point</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="poi-name" className="block text-xs text-gray-500 mb-1">
            Nom
          </label>
          <input
            id="poi-name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div>
          <label htmlFor="poi-address" className="block text-xs text-gray-500 mb-1">
            Adresse
          </label>
          <div className="flex gap-2">
            <input
              id="poi-address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            />
            <button
              type="button"
              onClick={handleLocate}
              disabled={geocoding || !address.trim()}
              className="px-3 py-2 text-sm rounded-md border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-50 shrink-0"
            >
              {geocoding ? "Recherche..." : "Localiser"}
            </button>
          </div>
          {geocodeError && (
            <p className="text-xs text-red-600 mt-1">{geocodeError}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="poi-postal-code" className="block text-xs text-gray-500 mb-1">
              Code postal
            </label>
            <input
              id="poi-postal-code"
              type="text"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div>
            <label htmlFor="poi-city" className="block text-xs text-gray-500 mb-1">
              Ville
            </label>
            <input
              id="poi-city"
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="poi-url" className="block text-xs text-gray-500 mb-1">
            Site web
          </label>
          <input
            id="poi-url"
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div>
          <label htmlFor="poi-comment" className="block text-xs text-gray-500 mb-1">
            Commentaire
          </label>
          <textarea
            id="poi-comment"
            maxLength={500}
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)] resize-none"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">Catégorie</p>
          <div className="grid grid-cols-2 gap-2">
            {categoryOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={category.includes(option.value)}
                  onChange={() =>
                    setCategory((prev) => toggleValue(prev, option.value))
                  }
                  className="accent-[var(--brand)]"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">Équipements</p>
          <div className="grid grid-cols-2 gap-2">
            {amenityOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={amenities.includes(option.value)}
                  onChange={() =>
                    setAmenities((prev) => toggleValue(prev, option.value))
                  }
                  className="accent-[var(--brand)]"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">Visibilité</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
                className="accent-[var(--brand)]"
              />
              Public
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "private"}
                onChange={() => setVisibility("private")}
                className="accent-[var(--brand)]"
              />
              Privé
            </label>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">Tarif</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="tier"
                checked={tier === "gratuit"}
                onChange={() => setTier("gratuit")}
                className="accent-[var(--brand)]"
              />
              Gratuit
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="tier"
                checked={tier === "payant"}
                onChange={() => setTier("payant")}
                className="accent-[var(--brand)]"
              />
              Payant
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="tier"
                checked={tier === "abonne"}
                onChange={() => setTier("abonne")}
                className="accent-[var(--brand)]"
              />
              Abonné
            </label>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Cliquez sur la carte pour placer le point, ou utilisez le bouton
          Localiser.
        </p>

        {position ? (
          <p className="text-xs text-gray-600">
            Position : {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            Choisissez un emplacement sur la carte ou via l&apos;adresse
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className={cn(
              "px-4 py-2 text-sm rounded-md bg-[var(--brand)] text-white hover:opacity-90 transition-opacity disabled:opacity-50",
            )}
          >
            {submitting ? "Ajout..." : submitLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-gray-200 text-gray-600 hover:border-gray-300"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
