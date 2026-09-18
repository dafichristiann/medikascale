import type { LucideIcon } from 'lucide-react';

interface KlinikModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function KlinikModulePlaceholder({ title, description, icon: Icon }: KlinikModulePlaceholderProps) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-1">{title}</h2>
        <p className="text-slate text-[13.5px] max-w-xl">{description}</p>
      </div>

      <section className="bg-white border border-border rounded-xl shadow-card p-6 sm:p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-teal-tint text-teal-dark flex items-center justify-center mb-4">
          <Icon size={24} />
        </div>
        <h3 className="font-bold text-[15px] mb-1.5">Modul dalam pengembangan</h3>
        <p className="text-[13px] text-slate max-w-md mx-auto">
          Halaman ini sudah tersedia untuk navigasi dan kontrol akses. Fitur operasional akan ditambahkan pada fase berikutnya.
        </p>
      </section>
    </div>
  );
}
