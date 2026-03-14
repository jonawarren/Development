import { useState } from 'react';
import type { SurveySubmit } from '../../types';
import { CuisineSelector } from './CuisineSelector';
import { DietaryRestrictions } from './DietaryRestrictions';
import { PriceRangeSelector } from './PriceRangeSelector';
import { AtmosphereSelector } from './AtmosphereSelector';
import { DistanceSelector } from './DistanceSelector';
import { ErrorBanner } from '../ErrorBanner';

interface Props {
  onSubmit: (data: SurveySubmit) => Promise<void>;
  submitting: boolean;
}

export function SurveyForm({ onSubmit, submitting }: Props) {
  const [cuisinesLiked, setCuisinesLiked] = useState<string[]>([]);
  const [cuisinesAvoided, setCuisinesAvoided] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(1);
  const [priceMax, setPriceMax] = useState(3);
  const [atmospheres, setAtmospheres] = useState<string[]>([]);
  const [distance, setDistance] = useState(2);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cuisinesLiked.length === 0) {
      setValidationError('Please select at least one cuisine you enjoy.');
      return;
    }
    setValidationError(null);
    await onSubmit({
      cuisines_liked: cuisinesLiked,
      cuisines_avoided: cuisinesAvoided,
      dietary_restrictions: dietary,
      price_min: priceMin,
      price_max: priceMax,
      atmospheres,
      max_distance_miles: distance,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {validationError && <ErrorBanner message={validationError} />}

      <CuisineSelector
        label="Cuisines you enjoy *"
        selected={cuisinesLiked}
        onChange={setCuisinesLiked}
      />

      <CuisineSelector
        label="Cuisines to avoid (optional)"
        selected={cuisinesAvoided}
        onChange={setCuisinesAvoided}
      />

      <DietaryRestrictions selected={dietary} onChange={setDietary} />

      <PriceRangeSelector
        min={priceMin}
        max={priceMax}
        onChange={(mn, mx) => { setPriceMin(mn); setPriceMax(mx); }}
      />

      <AtmosphereSelector selected={atmospheres} onChange={setAtmospheres} />

      <DistanceSelector value={distance} onChange={setDistance} />

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '0.85rem',
          background: submitting ? '#93c5fd' : '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Submitting...' : 'Submit My Preferences'}
      </button>
    </form>
  );
}
