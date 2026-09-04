/** Props for the {@link Title} component. */
interface TitleProps {
  title: string;
}

/**
 * Responsive large-text section heading.
 *
 * @param title - Text to display as the heading.
 */
export default function Title({ title }: TitleProps) {
  return (
    <p className="text-3xl leading-[1.29167] text-balance sm:text-3xl lg:text-4xl">
      {title}
    </p>
  );
}
