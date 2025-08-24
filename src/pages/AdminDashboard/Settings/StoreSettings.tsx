type StoreSettingsProps = {
  activeSettingsTab: string;
  setActiveSettingsTab: (tab: string) => void;
};

const StoreSettings: React.FC<StoreSettingsProps> = ({
  activeSettingsTab,
  setActiveSettingsTab
}) => {
  // Use props for settings rendering
  return <div>Store Settings</div>;
};
export default StoreSettings;
