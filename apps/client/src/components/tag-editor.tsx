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

const tagsFormSchema = z.object({
  title: z.string().nonempty(),
  album: z.string().nonempty(),
  artist: z.array(z.string().nonempty()),
  cover: z.instanceof(File),
});

export const TagEditor = ({ trackId, ...dialogProps }: TagEditorProps) => {
  const { data, isLoading } = useApiClient().useTracks({
    id: trackId,
  });

  const track = data?.at(0);

  const tagsForm = useForm<z.infer<typeof tagsFormSchema>>({
    resolver: zodResolver(tagsFormSchema),
    defaultValues: {},
  });

  const onSubmit = (values: z.infer<typeof tagsFormSchema>) => {
    console.log(values);
  };

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="with-blur">
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

              <Form {...tagsForm}>
                <form onSubmit={tagsForm.handleSubmit(onSubmit)}>
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
                </form>
              </Form>
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
