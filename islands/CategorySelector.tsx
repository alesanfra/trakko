import { h } from "preact";
import { useState } from "preact/hooks";

interface CategorySelectorProps {
  categories: string[];
  name: string;
  value?: string;
  onChange?: (newValue: string) => void;
}

export default function CategorySelector(
  { categories, name, value, onChange }: CategorySelectorProps,
) {
  const isControlled = value !== undefined && onChange !== undefined;
  const [internalSelected, setInternalSelected] = useState(
    value || categories[0] || "",
  );

  const selected = isControlled ? value : internalSelected;

  const handleSelect = (category: string) => {
    if (isControlled) {
      onChange(category);
    } else {
      setInternalSelected(category);
    }
  };

  return (
    <div>
      {!isControlled && <input type="hidden" name={name} value={selected} />}
      <div class="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            onClick={() => handleSelect(category)}
            class={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 border-2 ${
              selected === category
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-sky-100 dark:hover:bg-slate-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
