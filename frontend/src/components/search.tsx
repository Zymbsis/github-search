import { useSearchParams } from "react-router";

import Github from "./icons/github";
import Input from "./ui/input";
import Subtitle from "./ui/subtitle";
import Title from "./ui/title";
import Dropdown, { isCorrectSearchType } from "./ui/dropdown";
import { useEffect } from "react";

const SEARCH_PARAM = "search";
const TYPE_PARAM = "type";
const DEFAULT_TYPE = "users";

type SearchParamKey = typeof SEARCH_PARAM | typeof TYPE_PARAM;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get(SEARCH_PARAM) ?? "";
  const type = searchParams.get(TYPE_PARAM) ?? DEFAULT_TYPE;

  useEffect(() => {
    if (type && !isCorrectSearchType(type)) {
      setSearchParams((prevParams) => {
        const nextParams = new URLSearchParams(prevParams);
        nextParams.delete(TYPE_PARAM);
        return nextParams;
      });
    }
  }, [type]);

  const updateParam = (key: SearchParamKey, value: string) => {
    setSearchParams((prevParams) => {
      const nextParams = new URLSearchParams(prevParams);

      switch (key) {
        case SEARCH_PARAM:
          if (value.trim().length === 0) {
            nextParams.delete(key);
          } else {
            nextParams.set(key, value);
          }
          break;
        case TYPE_PARAM:
          if (value === DEFAULT_TYPE) {
            nextParams.delete(key);
          } else {
            nextParams.set(key, value);
          }
          break;
      }

      return nextParams;
    });
  };

  return (
    <>
      <div className="search-container">
        <Github width={64} height={64} />
        <div className="title-container">
          <Title>GitHub Searcher</Title>
          <Subtitle>Search users or repositories below</Subtitle>
        </div>
      </div>
      <div className="search-controls">
        <Input
          placeholder="Start typing to search .."
          value={query}
          onChange={(event) => updateParam(SEARCH_PARAM, event.target.value)}
        />
        <Dropdown value={type} onChange={(v) => updateParam(TYPE_PARAM, v)} />
      </div>
    </>
  );
};

export default Search;
