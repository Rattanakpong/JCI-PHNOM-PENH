export default function AdminGuidePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold text-brand-navy">Admin Operation Guide</h1>
      <p className="text-brand-navy/70">
        A short reference for incoming board members each annual transition:
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-brand-navy/80">
        <li>Ask the outgoing Super Admin to add you under Users &amp; Roles with the correct role.</li>
        <li>Event Organizers: create the event under Events, add ticket tiers, then paste the private Telegram link before publishing.</li>
        <li>
          Board Admins: update Homepage (slideshow + hero stats), News, Projects, and People
          (board roster + members directory) under Content.
        </li>
        <li>Keep the Contact page accurate under Site Settings — email, phone, address, map link, and social links.</li>
        <li>Verify payments under Registrations &amp; Payments as proofs come in; every action is written to the Audit Log.</li>
        <li>Before term end, review Users &amp; Roles and remove access for departing board members.</li>
      </ol>
    </div>
  );
}
