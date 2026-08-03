import { SlidersHorizontal } from "lucide-react";

import { PREFERENCE_FIELDS } from "../constants/notificationConstants";

export const NotificationPreferencesPanel = ({
  preferences,
  onToggle,
  isUpdating,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <SlidersHorizontal size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Notification preferences
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Control which email and in-app notification workflows are enabled.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {PREFERENCE_FIELDS.map((field) => {
          const checked = Boolean(preferences?.[field.key]);

          return (
            <label
              key={field.key}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-slate-100"
            >
              <span>
                <span className="block text-sm font-medium text-slate-800">
                  {field.label}
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">
                  {field.description}
                </span>
              </span>

              <input
                type="checkbox"
                checked={checked}
                disabled={isUpdating}
                onChange={(event) =>
                  onToggle({
                    [field.key]: event.target.checked,
                  })
                }
                className="mt-1 size-4 rounded border-slate-300 text-emerald-600"
              />
            </label>
          );
        })}
      </div>
    </section>
  );
};