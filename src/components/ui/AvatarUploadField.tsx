import { useRef, useState } from 'react';
import { HiOutlineCamera } from 'react-icons/hi2';
import Avatar from '../Avatar';
import { resolveAssetUrl } from '../../lib/assetUrl';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface AvatarUploadFieldProps {
  name: string;
  track?: string;
  avatarUrl?: string;
  onChange: (url: string) => void;
  onUpload?: (dataUrl: string) => Promise<void>;
  disabled?: boolean;
}

export function AvatarUploadField({
  name,
  track,
  avatarUrl,
  onChange,
  onUpload,
  disabled,
}: AvatarUploadFieldProps) {
  const { t } = useAppTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file || disabled) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      if (onUpload) {
        try {
          setUploading(true);
          await onUpload(dataUrl);
        } finally {
          setUploading(false);
        }
      } else {
        onChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="avatar-upload-field">
      <Avatar name={name} track={track} size="lg" url={resolveAssetUrl(avatarUrl)} />
      <div className="avatar-upload-field__actions">
        <button
          type="button"
          className="btn btn-secondary text-sm"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          <HiOutlineCamera className="h-4 w-4" />
          {uploading ? t('form.avatarUploading') : t('form.avatarUpload')}
        </button>
        {avatarUrl && (
          <button
            type="button"
            className="btn btn-secondary text-sm"
            disabled={disabled || uploading}
            onClick={() => onChange('')}
          >
            {t('form.avatarRemove')}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />
      <p className="text-xs text-muted mt-2">{t('form.avatarHint')}</p>
    </div>
  );
}
