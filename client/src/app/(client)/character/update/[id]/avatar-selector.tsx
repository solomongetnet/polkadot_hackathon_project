import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const AvatarSelector = ({
  selectedAvatarFile,
  setSelectedAvatarFile,
  disabled,
  handleRemoveSelectedAvatarFile,
  watch,
  avatarUrl,
}: {
  selectedAvatarFile: File | null;
  setSelectedAvatarFile: React.Dispatch<React.SetStateAction<File | null>>;
  disabled: boolean;
  handleRemoveSelectedAvatarFile: () => void;
  watch: any;
  avatarUrl: string | null;
}) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Please select an image smaller than 5MB");
        return;
      }
      setSelectedAvatarFile(file);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar
          size={"2xl"}
          className="md:w-24 md:h-24"
          alt=""
          src={
            (selectedAvatarFile
              ? URL.createObjectURL(selectedAvatarFile)
              : "") ||
            avatarUrl ||
            ""
          }
          loading="eager"
          interactive
          fallback={watch("name")}
        />
        {selectedAvatarFile ? (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
            onClick={handleRemoveSelectedAvatarFile}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 max-w-sm">
            <div className="relative flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
                disabled={disabled}
              />
              <Label
                htmlFor="avatar-upload"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full cursor-pointer"
              >
                {!selectedAvatarFile && <Pencil className="w-4 h-4" />}
              </Label>
            </div>
            {selectedAvatarFile && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveSelectedAvatarFile}
                disabled={disabled}
              >
                Remove
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarSelector;
