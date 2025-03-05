import { z } from "zod";
import {
  Dialog,
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
import { useState } from "react";
import { Button } from "./ui/button";

const tagsFormSchema = z.object({
  title: z.string().nonempty(),
  album: z.string().nonempty(),
  artist: z.string().nonempty(),
  cover: z.string(),
});

export const TagEditor = ({ trackId, ...dialogProps }: TagEditorProps) => {
  const { useTracks, getTrackCoverSrc } = useApiClient();
  const { data, isLoading } = useTracks({
    id: trackId,
  });

  const track = data?.at(0);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(
    getTrackCoverSrc(trackId),
  );

  const tagsForm = useForm<z.infer<typeof tagsFormSchema>>({
    resolver: zodResolver(tagsFormSchema),
    defaultValues: {
      title: track?.title ?? "",
      album: track?.album.title ?? "",
      artist: track?.artists.map((a) => a.name).join(", "),
    },
  });

  const onSubmit = (values: z.infer<typeof tagsFormSchema>) => {
    console.log(values);
  };

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

              <div className="mt-4 max-h-[400px] overflow-y-auto px-1" data-scroller>
                <Form {...tagsForm}>
                  <form
                    onSubmit={tagsForm.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={tagsForm.control}
                      name="cover"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>Cover</FormLabel>
                            {coverPreview && (
                              <img
                                className="my-2 aspect-square max-h-72 rounded-md object-cover"
                                src={coverPreview}
                              />
                            )}
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Choose cover"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  setCoverPreview(
                                    file
                                      ? URL.createObjectURL(file)
                                      : undefined,
                                  );

                                  field.onChange({
                                    target: {
                                      name: e.target.name,
                                      value: e.target.value,
                                    },
                                    type: "change",
                                  });
                                }}
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
                          <FormLabel>Title</FormLabel>
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
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-4">
                      <Button variant="secondary">Cancel</Button>
                      <Button type="submit">Apply</Button>
                    </div>
                  </form>
                </Form>
              </div>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export type TagEditorProps = {
  trackId: string;
} & DialogProps;
