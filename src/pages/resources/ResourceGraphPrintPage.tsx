import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import { getAssetResourceDetail } from '@/services/resourceLibraryService';
import '@/styles/resource-graph-print.css';

export default function ResourceGraphPrintPage() {
  const { specialtySlug, assetSlug } = useParams<{ specialtySlug: string; assetSlug: string }>();
  const navigate = useNavigate();

  const { data: asset, isLoading, isError } = useQuery({
    queryKey: ['resource-asset-print', specialtySlug, assetSlug, getDataMode()],
    queryFn: () => getAssetResourceDetail(specialtySlug!, assetSlug!),
    enabled: Boolean(specialtySlug && assetSlug),
  });

  const isGraph = asset?.assetType === 'graph';
  const imageUrl = asset?.imageUrlResolved ?? asset?.imageUrl;

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
            ? 'A impressão está disponível apenas para gráficos radiônicos.'
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
        <p className="text-xs text-neutral-500 hidden sm:block">Folha A4 — apenas o gráfico</p>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-500"
        >
          <Printer size={12} />
          Imprimir
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-4 flex justify-center print:py-0 print:px-0">
        <div
          className="graph-print-sheet bg-white shadow-xl print:shadow-none"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          <div
            className="px-12 pt-14 pb-10 flex flex-col items-center"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#1a1a2e' }}
          >
            <h1
              className="text-center text-2xl font-semibold tracking-wide mb-10 w-full"
              style={{ borderBottom: '2px solid #c9a84c', paddingBottom: '1rem' }}
            >
              {asset.name}
            </h1>

            <div className="graph-print-image-frame w-full flex-1 flex items-center justify-center min-h-[220mm] bg-[#faf9f6] rounded-lg border border-neutral-200">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={asset.name}
                  className="max-w-[85%] max-h-[240mm] w-auto h-auto object-contain"
                />
              ) : (
                <p className="text-sm text-neutral-500">Imagem não disponível</p>
              )}
            </div>

            {asset.originalName && (
              <p className="mt-8 text-center text-sm text-neutral-500">{asset.originalName}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
