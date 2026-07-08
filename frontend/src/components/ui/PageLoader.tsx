import Spinner from './Spinner';

export default function PageLoader() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}
