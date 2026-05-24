export default function ShipperTrackPage({ params }: { params: { loadId: string } }) {
  return <div className="p-6"><h1 className="text-xl font-semibold">Track Load #{params.loadId}</h1></div>;
}
