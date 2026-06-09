import { Navigate, useParams } from "react-router";
import { ExternalLink } from "lucide-react";
import BackLink from "./BackLink";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { findMusiqueRecording, musique } from "../../config/site";

export default function MusiqueRecordingDetail() {
  const { recordingSlug } = useParams<{ recordingSlug: string }>();
  const recording = recordingSlug
    ? findMusiqueRecording(recordingSlug)
    : undefined;

  if (!recording) {
    return <Navigate to={musique.enregistrementsPath} replace />;
  }

  return (
    <div>
      <BackLink
        to={musique.enregistrementsPath}
        label="Retour aux enregistrements"
      />
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">
            <div className="overflow-hidden bg-white">
              <ImageWithFallback
                src={recording.coverImage}
                alt={`${recording.title} — pochette`}
                className="w-full h-auto"
              />
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl mb-2">{recording.title}</h1>
              <p className="text-xl text-gray-700 mb-6">{recording.subtitle}</p>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-8">
                <div>
                  <dt className="text-gray-500">Artistes</dt>
                  <dd>{recording.artists}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Mon rôle</dt>
                  <dd>{recording.role}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Label</dt>
                  <dd>{recording.label}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Pays</dt>
                  <dd>{recording.country}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Format</dt>
                  <dd>{recording.format}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Enregistrement</dt>
                  <dd>{recording.recordedAt}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Style</dt>
                  <dd>{recording.genres.join(" · ")}</dd>
                </div>
              </dl>

              <div className="space-y-4 text-gray-700 leading-relaxed mb-8">
                {recording.body.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <a
                href={recording.discogsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white transition-colors"
              >
                Voir sur Discogs
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl mb-6">Tracklist</h2>
        <ol className="divide-y divide-gray-100">
          {recording.tracks.map((track, index) => (
            <li
              key={track.title}
              className="flex items-baseline justify-between gap-4 py-3 text-gray-700"
            >
              <span>
                <span className="text-gray-400 mr-3">{index + 1}.</span>
                {track.title}
                {track.writer && (
                  <span className="text-gray-500 text-sm ml-2">
                    ({track.writer})
                  </span>
                )}
              </span>
              <span className="text-gray-400 text-sm tabular-nums shrink-0">
                {track.duration}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
