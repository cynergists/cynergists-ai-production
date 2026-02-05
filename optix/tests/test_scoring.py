from optix.modules.ideation import DEFAULT_WEIGHTS, compute_score


def test_complexity_inversion():
    base_scores = {
        "pain_intensity": 4,
        "search_intent": 4,
        "trend_leverage": 3,
        "click_potential": 4,
        "production_complexity": 1,
        "channel_fit": 4,
    }
    high_complexity = dict(base_scores)
    high_complexity["production_complexity"] = 5

    low_total, _ = compute_score(base_scores, DEFAULT_WEIGHTS)
    high_total, _ = compute_score(high_complexity, DEFAULT_WEIGHTS)

    assert low_total > high_total


def test_weights_influence():
    weights = dict(DEFAULT_WEIGHTS)
    weights["search_intent"] = 2.0

    high_search = {
        "pain_intensity": 3,
        "search_intent": 5,
        "trend_leverage": 2,
        "click_potential": 3,
        "production_complexity": 3,
        "channel_fit": 3,
    }
    low_search = dict(high_search)
    low_search["search_intent"] = 1

    high_total, _ = compute_score(high_search, weights)
    low_total, _ = compute_score(low_search, weights)

    assert high_total > low_total
