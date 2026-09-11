import type { SolutionRecipe } from '@/lib/studio/contract';

export function RecipeQualifications({ recipe }: { recipe: SolutionRecipe }) {
  return (
    <div className="studio-qualifications">
      <h3>Assumptions to validate</h3>
      {recipe.assumptions.length ? (
        <ul>
          {recipe.assumptions.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      ) : (
        <p>
          No additional assumptions were listed. This is not proof that none
          remain.
        </p>
      )}
      <h3>Open decisions</h3>
      {recipe.openQuestions.length ? (
        <ul>
          {recipe.openQuestions.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      ) : (
        <p>
          No additional questions were listed. Independent review is still
          required.
        </p>
      )}
      <details>
        <summary>
          Proposed acceptance tests · {recipe.acceptanceTests.length}
        </summary>
        <ol>
          {recipe.acceptanceTests.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ol>
        <p className="studio-fine">
          These tests are proposed, not executed or passed.
        </p>
      </details>
    </div>
  );
}
