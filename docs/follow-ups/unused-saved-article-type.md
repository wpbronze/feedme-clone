# features/saved-articles/articles.ts의 SavedArticle 타입이 어디에서도 쓰이지 않음

**Symptom**: `SavedArticle` 타입이 export되어 있지만 참조하는 코드가 없습니다.

**Observed evidence**: 코드 리뷰(`code-review low`, 범위 `7fce5ab..HEAD`)가 `features/saved-articles/articles.ts`에서 지적했습니다. 목록·상세 페이지는 `select()`가 추론한 타입을 씁니다.

**Suspected cause**: 구현 초기에 목록 항목 타입으로 만들었다가 추론 타입으로 대체되면서 남은 것으로 보입니다(미확인).

**What was tried**: 동작에 영향이 없고 수용 기준과 무관해 손대지 않았습니다.

**Proposed next step**: 참조가 없음을 확인한 뒤 타입을 삭제하거나, 페이지에서 이 타입을 쓰도록 연결합니다.
