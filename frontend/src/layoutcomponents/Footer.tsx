
/**
 * Site footer displaying the copyright notice. No props required.
 */
export default function Footer() {
  return (
    <div className="px-10 py-5 flex flex-row justify-between items-center border-t border-stone-200 bg-white">
      <p className="text-xs text-stone-400">
        We do not collect, store, or share any personal information.
      </p>
      <div className="text-sm text-stone-500">©2025 growlab.com All rights reserved</div>
    </div>
  );
}
