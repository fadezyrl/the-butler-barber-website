"use client";

type AdminGuideProps = {
  title?: string;
  steps?: string[];
  children?: React.ReactNode;
};

export const AdminGuide = ({
  title = "How to use this page",
  steps,
  children,
}: AdminGuideProps): React.JSX.Element => {
  return (
    <div className="admin-guide" role="note">
      <strong className="admin-guide-title">{title}</strong>
      {steps && steps.length > 0 ? (
        <ol className="admin-guide-steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      {children ? <div className="admin-guide-body">{children}</div> : null}
    </div>
  );
};
