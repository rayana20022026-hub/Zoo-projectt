export default function Button({ children, className = '', variant = 'primary', ...props }) {
  return <button className={`${className} ${variant === 'secondary' ? 'admin-secondary-button' : 'admin-primary-button'}`.trim()} {...props}>{children}</button>
}
