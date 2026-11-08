const FieldError = ({ children, id }) =>
  children ? (
    <p className="mt-1 text-sm text-red-600" id={id} role="alert">
      {children}
    </p>
  ) : null;

export default FieldError;
