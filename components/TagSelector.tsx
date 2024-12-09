import { ProblemTag } from "@/types/Codeforces";

const TagSelector = ({
  allTags,
  selectedTags,
  onTagClick,
  onClearTags,
}: {
  allTags: ProblemTag[];
  selectedTags: ProblemTag[];
  onTagClick: (tag: ProblemTag) => void;
  onClearTags: () => void;
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => (
        <button
          key={tag.value}
          className={`px-2 py-1 rounded-md ${
            selectedTags.includes(tag)
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => onTagClick(tag)}
        >
          {tag.name}
        </button>
      ))}
      <button
        className="w-24 px-2 py-1 rounded-md bg-red-500 text-white"
        onClick={onClearTags}
      >
        Clear
      </button>
    </div>
  );
};

export default TagSelector;
