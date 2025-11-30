interface CalendarSelectProps {
  value: string;
  onChange: (val: string) => void;
  bgColor?: string;
  selectedBgColor?: string;
  unselectedBgColor?: string;
  selectedTextColor?: string;
  unselectedTextColor?: string;
}

export default function CalendarSelect({
  value,
  onChange,
  bgColor = "rgba(71, 85, 105, 0.5)",
  selectedBgColor = "#FFFFFF",
  unselectedBgColor = "rgba(51, 65, 85, 0.6)",
  selectedTextColor = "#0F172A",
  unselectedTextColor = "#CBD5E1",
}: CalendarSelectProps) {
  const options = [
    { id: "overdue", label: "Overdue" },
    { id: "due", label: "Due" },
    { id: "soon", label: "Soon" },
  ];

  return (
    <div className="w-full max-w-md mb-2 p-2">
      <div
        className="backdrop-blur-sm rounded-2xl p-2 sm:p-4 shadow-lg cursor-pointer"
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex gap-2 sm:gap-3">
          {options.map((option) => {
            const isSelected = value === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onChange(option.id)}
                className="
                  flex-1 py-4 px-2 sm:py-5 sm:px-4 rounded-lg font-bold 
                  font-[Poppins] text-sm sm:text-base transition-all duration-200 ease-out
                  cursor-pointer shadow-sm
                "
                style={{
                  backgroundColor: isSelected ? selectedBgColor : unselectedBgColor,
                  color: isSelected ? selectedTextColor : unselectedTextColor,
                  transform: isSelected ? "scale(1.05)" : "scale(1.0)",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
