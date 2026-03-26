import Modal from '@/components/Modal';
import { Link } from '@inertiajs/react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const hasPhotoCoordinates = (photo) => {
    const latitude = Number(photo?.latitude);
    const longitude = Number(photo?.longitude);

    return Number.isFinite(latitude) && Number.isFinite(longitude);
};

export default function ProjectPhotoPreview({
    show,
    onClose,
    previewPhoto,
    previewPhotoIndex,
    sortedPhotos,
    showPreviousPreviewPhoto,
    showNextPreviewPhoto,
    contractId,
    contractTitle,
    formatPostingDate,
    formatPhotoTime,
    actionHref,
    actionLabel,
}) {
    const previewCoordinates = hasPhotoCoordinates(previewPhoto)
        ? [Number(previewPhoto.latitude), Number(previewPhoto.longitude)]
        : null;

    return (
        <Modal show={show} maxWidth="4xl" onClose={onClose}>
            <div className="flex h-[92vh] max-h-[92vh] flex-col bg-black">
                <div className="flex items-center justify-between px-5 py-4 text-white">
                    <div>
                        <h3 className="text-lg font-semibold">Project Photo Preview</h3>
                        {previewPhoto && (
                            <p className="mt-1 text-sm text-white/70">
                                Photo {previewPhotoIndex + 1} of {sortedPhotos.length} - {formatPostingDate(previewPhoto.photo_date)} at {formatPhotoTime(previewPhoto.photo_time)}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Close
                    </button>
                </div>

                {actionHref && actionLabel && (
                    <div className="px-5 pb-2">
                        <Link
                            href={actionHref}
                            className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                        >
                            {actionLabel}
                        </Link>
                    </div>
                )}

                {previewPhoto && (
                    <div className="grid min-h-0 flex-1 gap-5 overflow-hidden px-5 pb-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="flex min-h-0 min-w-0 items-center justify-center gap-3">
                            {sortedPhotos.length > 1 && (
                                <button
                                    type="button"
                                    onClick={showPreviousPreviewPhoto}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                                    aria-label="Previous photo"
                                >
                                    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current">
                                        <path d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" />
                                    </svg>
                                </button>
                            )}

                            <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl">
                                <img
                                    src={previewPhoto.photo_url}
                                    alt={`${contractId} preview`}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>

                            {sortedPhotos.length > 1 && (
                                <button
                                    type="button"
                                    onClick={showNextPreviewPhoto}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                                    aria-label="Next photo"
                                >
                                    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current">
                                        <path d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" />
                                    </svg>
                                </button>
                                )}
                            </div>

                        <aside className="min-h-0 overflow-y-auto rounded-2xl border border-white/10 bg-white/6 text-white">
                            <div className="border-b border-white/10 px-4 py-3">
                                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
                                    Photo Details
                                </h4>
                            </div>

                            <div className="space-y-3 p-4">
                                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                                    {previewCoordinates ? (
                                        <MapContainer
                                            key={`${previewPhoto.id}-${previewCoordinates[0]}-${previewCoordinates[1]}`}
                                            center={previewCoordinates}
                                            zoom={15}
                                            scrollWheelZoom={false}
                                            style={{ height: '180px', width: '100%' }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <CircleMarker center={previewCoordinates} radius={9} pathOptions={{ color: '#ffffff', fillColor: '#2563eb', fillOpacity: 0.95, weight: 2 }}>
                                                <Popup>Photo location</Popup>
                                            </CircleMarker>
                                        </MapContainer>
                                        ) : (
                                        <div className="flex h-[180px] items-center justify-center px-6 text-center text-sm text-white/60">
                                            No GPS coordinates available for this photo.
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2.5 text-sm">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Contract ID</p>
                                        <p className="mt-0.5 break-words text-sm text-white">{contractId || '---'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Contract Title</p>
                                        <p className="mt-0.5 break-words text-sm leading-5 text-white">{contractTitle || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Date</p>
                                        <p className="mt-0.5 text-sm text-white">{formatPostingDate(previewPhoto.photo_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Time</p>
                                        <p className="mt-0.5 text-sm text-white">{formatPhotoTime(previewPhoto.photo_time)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Location</p>
                                        <p className="mt-0.5 break-all text-sm leading-5 text-white">{previewPhoto.location || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Latitude</p>
                                        <p className="mt-0.5 text-sm text-white">{previewPhoto.latitude || '---'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Longitude</p>
                                        <p className="mt-0.5 text-sm text-white">{previewPhoto.longitude || '---'}</p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </Modal>
    );
}
