import { useState } from "preact/hooks";

interface CategorySelectorProps {
  categories: string[];
  name: string;
}

export default function CategorySelector({ categories, name }: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");

  return (
    <div>
      <div class="flex flex-wrap gap-3">
        {categories.map((category) => (
          <div key={category}>
            <input
              type="radio"
              id={`category-${category}`}
              name={name}
              value={category}
              class="sr-only peer"
              checked={selectedCategory === category}
              onChange={() => setSelectedCategory(category)}
            />
            <label
              htmlFor={`category-${category}`}
              class="block cursor-pointer px-4 py-2 rounded-full border-2 transition-colors
                     border-slate-300 dark:border-slate-600
                     text-slate-600 dark:text-slate-300
                     peer-checked:bg-sky-600 peer-checked:text-white
                     peer-checked:border-sky-600
                     hover:border-sky-500"
            >
              {category}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
