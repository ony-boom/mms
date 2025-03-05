import { z } from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useApiClient } from "@/hooks";
import { Skeleton } from "./ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogProps } from "@radix-ui/react-dialog";
import { Input } from "./ui/input";
import {
  ChangeEventHandler,
  ElementRef,
  MouseEventHandler,
  useRef,
  useState,
} from "react";
import { Button } from "./ui/button";
import { Track } from "@/api";

const tagsFormSchema = z.object({
  title: z.string().nonempty(),
  album: z.string().nonempty(),
  artist: z.string().nonempty(),
  cover: z.string(),
});

export const TagEditor = ({ trackId, ...dialogProps }: TagEditorProps) => {
  const { useTracks } = useApiClient();
  const { data, isLoading } = useTracks(
    {
      id: trackId,
    },
    undefined,
    {
      enabled: dialogProps.open,
    },
  );

  const track = data?.at(0);

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="with-blur" data-scroller>
        {isLoading ? (
          <>
            <DialogHeader>
              <DialogTitle>
                <Skeleton className="h-4 w-full" />
              </DialogTitle>

              <DialogDescription>
                <p>Tags are used to categorize your tracks.</p>
              </DialogDescription>
            </DialogHeader>
          </>
        ) : (
          track && (
            <>
              <DialogHeader>
                <DialogTitle>Edit tags</DialogTitle>
              </DialogHeader>

              <DialogDescription>
                <p>Tags are used to categorize your tracks.</p>
              </DialogDescription>

              <div data-scroller={true} className="mt-4">
                <TagsForm track={track} />
              </div>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

const TagsForm = ({ track }: { track: Track }) => {
  const { getTrackCoverSrc } = useApiClient();
  const defaultCoverSrc = getTrackCoverSrc(track.id);
  const [coverPreview, setCoverPreview] = useState<string>(defaultCoverSrc);
  const imageInputRef = useRef<ElementRef<"input">>(null);

  const tagsForm = useForm<z.infer<typeof tagsFormSchema>>({
    resolver: zodResolver(tagsFormSchema),
    defaultValues: {
      title: track.title ?? "",
      album: track.album.title ?? "",
      artist: track.artists.map((a) => a.name).join(", "),
      cover: "", // since it's accept a Filename
    },
  });

  const onSubmit = async (values: z.infer<typeof tagsFormSchema>) => {
    // replace cover in values to cover preview but in base64
    const blob = await fetch(coverPreview).then((res) => res.blob());
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      values.cover = base64data as string;

      //TODO: send the values to the server
      console.log(values);
    };
  };

  const handleImageClick: MouseEventHandler<HTMLImageElement> = () => {
    imageInputRef.current?.click();
  };

  const handleCoverChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    setCoverPreview(file ? URL.createObjectURL(file) : defaultCoverSrc);

    tagsForm.setValue("cover", e.target.value);
  };

  return (
    <Form {...tagsForm}>
      <form onSubmit={tagsForm.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={tagsForm.control}
          name="cover"
          render={({ field }) => {
            return (
              <FormItem>
                <div className="h-64 overflow-hidden rounded-md">
                  <img
                    alt={track.title}
                    src={coverPreview}
                    className="mx-auto my-2 rounded-md object-center"
                    onClick={handleImageClick}
                  />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    ref={imageInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverChange}
                  />
                </FormControl>
              </FormItem>
            );
          }}
        />

        <FormField
          control={tagsForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={tagsForm.control}
          name="album"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Albums</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={tagsForm.control}
          name="artist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artists</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit">Apply</Button>
        </div>
      </form>
    </Form>
  );
};
export type TagEditorProps = {
  trackId: string;
} & DialogProps;
