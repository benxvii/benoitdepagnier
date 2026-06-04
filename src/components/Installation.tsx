import { installation } from "../config/site";

const platformLabel: Record<string, string> = {
  windows: "Windows",
  macos: "macOS",
};

export default function Installation() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-light mb-4">{installation.title}</h1>
      <p className="text-gray-500 mb-16 text-sm">
        Ces applications sont distribuées sans signature de code. Une étape
        manuelle est nécessaire au premier lancement.
      </p>

      {installation.apps.map((app) => (
        <section key={app.slug} id={app.slug} className="mb-16">
          <h2 className="text-xl font-medium mb-1">{app.title}</h2>
          <p className="text-gray-500 text-sm mb-6">{app.intro}</p>

          {app.platforms.map((platform) => {
            const data = installation[platform as "windows" | "macos"];
            return (
              <div key={platform} className="mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  {platformLabel[platform]}
                </h3>
                <ol className="space-y-2 mb-4">
                  {data.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="text-gray-300 select-none">{i + 1}.</span>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: step
                            .replace(
                              /\*\*(.*?)\*\*/g,
                              "<strong>$1</strong>",
                            )
                            .replace(
                              /`(.*?)`/g,
                              "<code class='bg-gray-100 px-1 rounded text-xs'>$1</code>",
                            ),
                        }}
                      />
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-4 py-3">
                  {data.warning}
                </p>
              </div>
            );
          })}

          {app.notice && (
            <p className="text-xs text-gray-400 border-l-2 border-gray-200 pl-4 mt-2">
              {app.notice}
            </p>
          )}
        </section>
      ))}
    </main>
  );
}
