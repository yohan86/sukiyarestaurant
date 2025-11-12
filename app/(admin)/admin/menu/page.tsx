import MenuTable from "@/components/admin/MenuTable";

export default function MenuPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Food menu</h1>
      </div>
      <MenuTable />
    </div>
  );
}


