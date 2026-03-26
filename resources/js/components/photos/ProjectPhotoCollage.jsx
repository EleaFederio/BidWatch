export default function ProjectPhotoCollage({ photo, onClick }) {
    if (!photo) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative block overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.12)]"
        >
            <img
                src={photo.photo_url}
                alt={`${photo.contract_id} collage`}
                className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        </button>
    );
}
