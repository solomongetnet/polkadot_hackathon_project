"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Loader2, X, RotateCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useGenerateCharacterPromptMutation,
  useUpdateCharacterMutation,
} from "@/hooks/api/use-character";
import PersonalitySelector from "./personality-selector";
import { VoiceSelectionModal } from "./voice-selection-modal";
import AvatarSelector from "./avatar-selector";
import { UpdateCharacterInput, updateCharacterSchema } from "./validator";
import ThemeModal from "./theme-modal";
import { $Enums } from "@/generated/prisma";

interface CharacterData {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  themeId: string | null;
  description: string;
  tagline: string;
  personality: string;
  prompt: string;
  voiceStyle: string | null;
  visibility: $Enums.CharacterVisibility;
  creatorId: string;
}

export function FormContainer({
  characterData,
}: {
  characterData: CharacterData;
}) {
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [selectedVoice, setSelectedVoice] = useState<{
    name: string;
    voice_id: string;
  } | null>({
    name: characterData.voiceStyle || "",
    voice_id: characterData.voiceStyle || "",
  });
  const [isVoiceSelectionModalOpen, setIsVoiceSelectionModalOpen] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateCharacterInput>({
    resolver: yupResolver(updateCharacterSchema as any),
    defaultValues: {
      description: characterData.description,
      name: characterData.name,
      personality: characterData.personality,
      prompt: characterData.prompt,
      tagline: characterData.tagline,
      visibility: characterData.visibility as any,
      backgroundUrl: characterData.backgroundUrl,
      themeId: characterData.themeId,
    },
    disabled: !characterData,
  });

  const mutation = useUpdateCharacterMutation();
  const generateCharacterPrompt = useGenerateCharacterPromptMutation();
  const showPromptGenerateButton =
    watch("name") &&
    watch("personality") &&
    watch("tagline") &&
    watch("description");

  const handleVoiceSelect = (voice: { name: string; voice_id: string }) => {
    setSelectedVoice(voice);
    setIsVoiceSelectionModalOpen(false); // Close modal after selection
  };

  const handleRemoveSelectedAvatarFile = useCallback(() => {
    setSelectedAvatarFile(null);
  }, []);

  const onSubmit = async (data: UpdateCharacterInput) => {
    await mutation.mutateAsync({
      data: {
        avatarFile: selectedAvatarFile,
        description: data.description,
        name: data.name,
        personality: data.personality,
        prompt: data.prompt,
        tagline: data.tagline,
        visibility: data.visibility,
        voiceStyle: selectedVoice?.voice_id,
        backgroundUrl: data.backgroundUrl || null,
        themeId: data.themeId || null,
        avatarUrl: characterData.avatarUrl || "",
      },
      characterId: characterData.id,
    });
  };

  const handleGenerateCharacterPrompt = async () => {
    try {
      const response = await generateCharacterPrompt.mutateAsync({
        description: watch("description"),
        tagline: watch("tagline"),
        personality: watch("personality"),
        name: watch("name"),
      });
      setValue("prompt", "");
      setValue("prompt", response.prompt!);
    } catch (error) {
      // Handle prompt generation error if needed
      toast.error("Failed to generate prompt. Please try again.");
    }
  };

  const handleReset = useCallback(() => {
    reset();
    handleRemoveSelectedAvatarFile();
  }, [reset, handleRemoveSelectedAvatarFile]);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full space-y-6 px-4 sm:px-6"
      >
        {/* Avatar Selector Section */}
        <AvatarSelector
          disabled={mutation.isPending}
          handleRemoveSelectedAvatarFile={handleRemoveSelectedAvatarFile}
          selectedAvatarFile={selectedAvatarFile}
          setSelectedAvatarFile={setSelectedAvatarFile}
          watch={watch}
          avatarUrl={characterData.avatarUrl}
        />

        {/* name */}
        <div className="space-y-2 pt-2">
          <Label htmlFor="name">Character Name *</Label>
          <Input
            className="text-sm py-5 md:py-6"
            id="name"
            {...register("name")}
            placeholder="Character name"
            disabled={mutation.isPending}
          />
          <div className="w-full flex justify-end text-xs font-light opacity-70">
            {watch("name").length} / 20
          </div>

          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* tagline*/}
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline *</Label>
          <Input
            className="text-sm py-5 md:py-6"
            id="tagline"
            {...register("tagline")}
            placeholder="Brief character tagline"
            disabled={mutation.isPending}
          />
          <div className="w-full flex justify-end text-xs font-light opacity-70">
            {watch("tagline").length} / 60
          </div>
          {errors.tagline && (
            <p className="text-sm text-destructive">{errors.tagline.message}</p>
          )}
        </div>

        {/* description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Detailed character description (10-500 characters)"
            className="min-h-[100px] text-sm"
            disabled={mutation.isPending}
          />
          <div className="w-full flex justify-end text-xs font-light opacity-70">
            {watch("description").length} / 500
          </div>
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* personality */}
        <div className="space-y-2">
          <Label htmlFor="">Personality Traits*</Label>
          <PersonalitySelector setValue={setValue} />
          {errors.personality && (
            <p className="text-sm text-destructive">
              {errors.personality.message}
            </p>
          )}
        </div>

        {/* prompt */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="prompt">Prompt *</Label>
            {showPromptGenerateButton && (
              <Button
                size={"icon"}
                className=""
                variant={"outline"}
                type="button"
                onClick={handleGenerateCharacterPrompt}
                disabled={generateCharacterPrompt.isPending}
              >
                <RotateCw
                  className={`w-4 ${
                    generateCharacterPrompt.isPending && "animate-spin"
                  }`}
                />
              </Button>
            )}
          </div>
          <Textarea
            id="prompt"
            {...register("prompt")}
            placeholder="Character interaction prompt (10-500 characters)"
            className="min-h-[120px] text-sm"
            disabled={mutation.isPending}
          />
          <div className="w-full flex justify-end text-xs font-light opacity-70">
            {watch("prompt").length} / 500
          </div>
          {errors.prompt && (
            <p className="text-sm text-destructive">{errors.prompt.message}</p>
          )}
        </div>

        {/* voice */}
        <div className="space-y-2 w-full">
          <Label htmlFor="voiceStyle">Voice </Label>
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={() => setIsVoiceSelectionModalOpen(true)}
              variant={"outline"}
              type="button"
              className="w-full py-4 md:py-6 flex justify-between"
              disabled={mutation.isPending}
            >
              <span className="text-base">
                {selectedVoice?.name ? selectedVoice.name : "Select Voice"}
              </span>
              <ChevronDown className="opacity-30" />
            </Button>
          </div>
        </div>

        {/* theme */}
        <div className="space-y-2 w-full">
          <Label htmlFor="visibility">Customize theme</Label>
          <ThemeModal
            setValue={setValue as any}
            watch={watch}
            disabled={mutation.isPending}
          />
        </div>

        {/* visiblity */}
        <div className="space-y-2 w-full">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            value={watch("visibility")}
            onValueChange={(value: "PUBLIC" | "PRIVATE") =>
              setValue("visibility", value)
            }
            disabled={mutation.isPending}
          >
            <SelectTrigger className="w-full py-5 md:py-6">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent className="text-sm w-full">
              <SelectItem value="PUBLIC">Public</SelectItem>
              <SelectItem value="PRIVATE">Private</SelectItem>
            </SelectContent>
          </Select>
          {errors.visibility && (
            <p className="text-sm text-destructive">
              {errors.visibility.message}
            </p>
          )}
        </div>

        {/* submit action */}
        <div className="flex justify-end space-x-2 py-3 ">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full md:w-fit py-5 md:py-5 rounded-full "
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Update Character
          </Button>
        </div>
      </form>

      <VoiceSelectionModal
        isOpen={isVoiceSelectionModalOpen}
        onOpenChange={setIsVoiceSelectionModalOpen}
        onVoiceSelect={handleVoiceSelect}
        selectedVoiceId={selectedVoice?.voice_id || null}
      />
    </>
  );
}
