import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ResourceGraphPdfButton } from '@/components/resources/ResourceGraphPdfButton';
import { getDataMode } from '@/lib/dataMode';
import {
  buildGraphPrintSpec,
  getPhysicalPrintLabel,
  getPreviewImageUrl,
} from '@/lib/pdf/graphPrintTypes';
import { getAssetResourceDetail } from '@/services/resourceLibraryService';
import '@/styles/resource-graph-print.css';

/**
 * PDF preview / debug (screen only). Export uses pdf-lib + print_image_url when set.
 */
export default function ResourceGraphPrintPage() {
  const { specialtySlug, assetSlug } = useParams<{ specialtySlug: string; assetSlug: string }>();
  const navigate = useNavigate();

  const { data: asset, isLoading, isError } = useQuery({
    queryKey: ['resource-asset-print', specialtySlug, assetSlug, getDataMode()],
    queryFn: () => getAssetResourceDetail(specialtySlug!, assetSlug!),
    enabled: Boolean(specialtySlug && assetSlug),
  });

  const isGraph = asset?.assetType === 'graph';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <Loader2 size={28} className="animate-spin text-neutral-500" />
      </div>
    );
  }

  if (isError || !asset || !isGraph) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-100 p-6">
        <p className="text-sm text-neutral-600">
          {!isGraph && asset
            ? 'A pré-visualização está disponível apenas para gráficos radiônicos.'
            : 'Gráfico não encontrado.'}
        </p>
        <Link
          to={`/resources/${specialtySlug}/assets/${assetSlug}`}
          className="text-sm text-amber-700 hover:underline"
        >
          Voltar ao asset
        </Link>
      </div>
    );
  }

  const spec = buildGraphPrintSpec(asset);
  const sizeCm = spec?.printSizeCm ?? 21;
  const sheetMm = sizeCm * 10;
  const displayUrl = spec?.printImageUrl ?? getPreviewImageUrl(asset);
  const physicalLabel = spec ? getPhysicalPrintLabel(spec) : `${sizeCm}×${sizeCm} cm`;

  return (
    <div className="graph-print-root min-h-screen flex flex-col bg-neutral-200">
      <div className="graph-print-toolbar flex-shrink-0 px-5 py-3 border-b border-neutral-300 bg-white flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/resources/${specialtySlug}/assets/${assetSlug}`)}
          className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft size={13} />
          Voltar
        </button>
        <div className="flex-1" />
        <p className="text-xs text-neutral-500 hidden sm:block">
          Pré-visualização — {physicalLabel}
          {spec?.usedPreviewImageFallback ? ' · imagem de pré-visualização' : ''}
        </p>
        <ResourceGraphPdfButton
          specialtySlug={specialtySlug!}
          assetSlug={asset.slug}
          asset={asset}
        />
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-4 flex justify-center">
        <div
          className="graph-print-sheet bg-white shadow-xl"
          style={{ width: `${sheetMm}mm`, minHeight: `${sheetMm}mm` }}
          data-print-size-cm={sizeCm}
          data-layout={spec?.layoutId}
        >
          <div
            className="px-8 pt-10 pb-8 flex flex-col items-center h-full"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#1a1a2e' }}
          >
            <h1
              className="text-center text-xl font-semibold tracking-wide mb-8 w-full"
              style={{ borderBottom: '2px solid #c9a84c', paddingBottom: '0.75rem' }}
            >
              {asset.name}
            </h1>

            <div className="w-full flex-1 flex items-center justify-center min-h-[140mm] bg-white">
              {displayUrl ? (
                <img
                  src={displayUrl}
                  alt={asset.name}
                  className="max-w-[90%] max-h-[90%] w-auto h-auto object-contain"
                />
              ) : (
                <p className="text-sm text-neutral-500">Imagem não disponível</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
