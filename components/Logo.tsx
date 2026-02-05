export default function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <img src="/transfer.png" alt="Logo" width={30} height={30} />
      <div className="flex items-center text-xl text-black font-bold">
        Safe<span className="text-blue-600">Store</span>
      </div>
    </div>
  );
}
