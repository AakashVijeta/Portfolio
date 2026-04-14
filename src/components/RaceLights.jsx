const RaceLights = () => (
  <div className="race-lights" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((i) => (
      <span
        key={i}
        className="race-lights-pillar"
        style={{ "--i": i }}
      >
        <span className="race-lights-lamp" />
        <span className="race-lights-lamp" />
      </span>
    ))}
  </div>
);

export default RaceLights;
