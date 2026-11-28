import type { CriteriaItem, SerializedRow } from "../../types";

type PreviewField = Pick<
  CriteriaItem,
  "label" | "description" | "unit" | "value_type"
> & {
  rows?: SerializedRow[];
};

export interface CriteriaPreviewProps {
  fields: PreviewField[];
  groupRequired?: boolean;
}

export function CriteriaPreview({
  fields,
  groupRequired,
}: CriteriaPreviewProps) {
  return (
    <div className="s2-criteria-preview">
      {groupRequired !== undefined && (
        <p className="s2-criteria-description__text">
          {groupRequired ? "Required group" : "Optional group"}
        </p>
      )}
      {fields.map((field) => (
        <section key={field.label} className="s2-criteria-preview__field">
          {groupRequired !== undefined && <h4>{field.label}</h4>}
          {field.description?.trim() && (
            <p className="s2-criteria-description__text">{field.description}</p>
          )}
          {field.rows?.length ? (
            field.rows.map((row) => (
              <div
                key={row.id}
                className="s2-criteria-window__row s2-criteria-preview__row"
              >
                <span className="s2-criteria-preview__value" dir="auto">
                  {row.inputValue.trim() ? (
                    <>
                      {field.value_type === "numeric" &&
                        `${row.numericOperator || "="} `}
                      {row.inputValue}
                      {field.unit && ` ${field.unit}`}
                    </>
                  ) : (
                    "No value set"
                  )}
                </span>
                <span>{row.isRequired ? "Required" : "Optional"}</span>
              </div>
            ))
          ) : (
            <p className="s2-criteria-description__text">
              No rules configured.
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
