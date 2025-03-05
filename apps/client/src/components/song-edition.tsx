import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useApiClient } from "@/hooks"
import { SongMetadata, useSongMetadataStore } from "@/stores/song"
import { SubmitHandler, useForm } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

export const SongEdition = () => {
  const { isOpenEdition, closeSongEdition, metadata, trackId } = useSongMetadataStore();
  const {modified, ...rest} = metadata;
  const { data, isLoading } = useApiClient().useSingleTrack?.({id: trackId});
  const {id, path, artists, isFavorite, ...initialMetadata} = data ?? {id: null, path: '', artists:'', isFavorite:''};
  const defaultValues = {...rest,...initialMetadata};
  const {
    handleSubmit,
    control,
  } = useForm<SongMetadata>({
    defaultValues,
  })
  const onSubmit: SubmitHandler<SongMetadata> = (data) => console.log(data)

  if(isLoading) {
    return;
  }

  return (
    <Dialog open={isOpenEdition} onOpenChange={() => closeSongEdition()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Song information</DialogTitle>
          <DialogDescription>
            Make changes to your song here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            {(Object.keys(defaultValues) as Array<keyof typeof metadata>).map((name) => (
              <FormField
                key={name}
                control={control}
                name={name}
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>{field.name}</FormLabel>
                    <FormControl>
                      <Input placeholder={`${name}... `} value={String(field.value)} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" className="mt-4" variant="secondary">Save</Button>
          </form>
      </DialogContent>
    </Dialog>
  )
}


