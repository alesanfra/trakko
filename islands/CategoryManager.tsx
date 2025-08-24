import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

interface CategoryManagerProps {
  t: Record<string, string>;
  defaultCategories: string;
  name: string;
}

export default function CategoryManager(
  { t, defaultCategories, name }: CategoryManagerProps,
) {
  const initialCategories = defaultCategories.split(",").map((c) => c.trim())
    .filter(Boolean);
  const [categories, setCategories] = useState([...initialCategories, ""]);

  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;

    if (index === categories.length - 1 && value.trim() !== "") {
      setCategories([...newCategories, ""]);
    } else {
      setCategories(newCategories);
    }
  };

  const handleDelete = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const handleBlur = (index: number, value: string) => {
    if (value.trim() === "" && index !== categories.length - 1) {
      handleDelete(index);
    }
  };

  const finalCategories = categories.map((c) => c.trim()).filter(Boolean);

  return (
    <div>
      <input
        type="hidden"
        name={name}
        value={finalCategories.join(", ")}
      />
      <div class="space-y-2">
        {categories.map((category, index) => (
          <div key={index} class="flex items-center space-x-2">
            <input
              type="text"
              value={category}
              onInput={(e) =>
                handleCategoryChange(
                  index,
                  (e.target as HTMLInputElement).value,
                )}
              onBlur={(e) =>
                handleBlur(index, (e.target as HTMLInputElement).value)}
              class="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder={index === categories.length - 1
                ? t.add_category_placeholder
                : ""}
              disabled={!IS_BROWSER}
            />
            {index !== categories.length - 1
              ? (
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  class="p-3 bg-slate-400 text-white rounded-md hover:bg-slate-500 flex-shrink-0"
                  disabled={!IS_BROWSER}
                  aria-label={t.delete_category_label}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              )
              : <div class="w-[44px] flex-shrink-0"></div>}
          </div>
        ))}
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {t.categories_helper}
      </p>
    </div>
  );
}
