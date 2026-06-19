import { ImageIcon } from 'lucide-react';

const ImageUploader = ({
  onUpload,
  isUploading,
}: {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading: boolean;
}) => (
  <div className="relative w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground hover:border-primary transition-colors">
    <input
      type="file"
      accept="image/*"
      onChange={onUpload}
      disabled={isUploading}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      multiple
    />
    {isUploading ? (
      <span className="animate-pulse">Uploading...</span>
    ) : (
      <div className="flex flex-col items-center">
        <ImageIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Add Images</span>
      </div>
    )}
  </div>
);

export default ImageUploader