"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/admin-pagination";
import { Avatar } from "@/components/shared/avatar";
import React from "react";
import { useSearchParams } from "next/navigation";
import {
  clearAllSearchParams,
  deleteSearchParam,
  setValueToSearchParam,
} from "@/utils/search-params";
import { UsersTableSkeleton } from "./loaders";
import { Input } from "@/components/ui/input";
import { Search, Trash } from "lucide-react";
import RefetchDataButton from "../_components/refetch-data-button";
import {
  useDeleteCharacterForAdminMutation,
  useGetCharactersForAdminQuery,
} from "@/hooks/api/use-character";

const CharactersContainer = () => {
  const searchParams = useSearchParams();
  const pageSearchParam = Number(searchParams.get("page")) || 1;
  const limitSearchParam = Number(searchParams.get("limit")) || 5;
  const querySearchParam = searchParams.get("query") || undefined;
  const sortDirectionSearchParam =
    searchParams.get("sortDirection") || undefined;
  const sortFieldSearchParam = searchParams.get("sortField") || undefined;
  const userRoleSearchParam = searchParams.get("userRole") || undefined;
  const userStatusSearchParam = searchParams.get("userStatus") || undefined;

  const charactersDataQuery = useGetCharactersForAdminQuery({
    limit: limitSearchParam,
    page: pageSearchParam,
    search: querySearchParam,
    sortDirection: sortDirectionSearchParam,
    sortField: sortFieldSearchParam,
    role: userRoleSearchParam,
    status: userStatusSearchParam,
  });

  const deleteCharacterMutation = useDeleteCharacterForAdminMutation();

  useEffect(() => {
    charactersDataQuery.refetch();
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    setValueToSearchParam("page", page.toString());
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (value === "" || !value) {
      deleteSearchParam("query");
    } else {
      setValueToSearchParam("query", value);
    }
  };

  const handleLimitChange = (limit: number) => {
    setValueToSearchParam("limit", limit.toString());
  };

  return (
    <Card className="overflow-x-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card/50 backdrop-blur">
      {charactersDataQuery?.isPending || charactersDataQuery?.isFetching ? (
        <UsersTableSkeleton />
      ) : (
        charactersDataQuery?.data &&
        charactersDataQuery?.data?.data && (
          <>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Detailed Characters Information
              </CardTitle>

              <div className="flex items-center gap-1 sm:gap-2">
                <RefetchDataButton
                  refetch={charactersDataQuery.refetch}
                  isLoading={charactersDataQuery.isFetching}
                />
                <div className="w-fit flex items-center relative">
                  <Search className="w-3.5 absolute left-2.5" />
                  <Input
                    placeholder="Search"
                    className="w-[140px] md:w-[200px] bg-transparent pl-8"
                    onChange={handleSearchInputChange}
                    defaultValue={querySearchParam}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 overflow-x-scroll max-w-full">
              {charactersDataQuery.data.data.length < 1 ||
              !charactersDataQuery.data.data ? (
                <div className="py-20 w-full flex justify-center items-center flex-col">
                  <h2>Can't find data what you are looking for</h2>
                  {searchParams && (
                    <Button
                      variant={"outline"}
                      onClick={() => clearAllSearchParams()}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Interactions</TableHead>
                      <TableHead>Visiblitiy</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charactersDataQuery.data.data.map((character) => (
                      <TableRow
                        key={character.id}
                        className="hover:bg-muted/50"
                      >
                        <TableCell>
                          <Avatar
                            src={character.avatarUrl || "/placeholder.svg"}
                            size={"md"}
                            fallback={character.name}
                          />
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{character.name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">
                            {character.creator.name}
                          </p>{" "}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {character._count.messages}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {character.visibility.toLocaleLowerCase()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {character.createdAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              deleteCharacterMutation.mutate({
                                characterId: character.id,
                              })
                            }
                            disabled={
                              deleteCharacterMutation.variables?.characterId ===
                                character.id &&
                              deleteCharacterMutation.isPending &&
                              true
                            }
                          >
                            <Trash />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <Pagination
                currentPage={charactersDataQuery.data.pagination.currentPage}
                totalPages={charactersDataQuery.data.pagination.totalPages}
                totalItems={charactersDataQuery.data.pagination.totalItems}
                limit={charactersDataQuery.data.pagination.limit}
                hasMore={charactersDataQuery.data.pagination.hasMore}
                previousPage={charactersDataQuery.data.pagination.previousPage}
                nextPage={charactersDataQuery.data.pagination.nextPage}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                limitOptions={[5, 10, 20, 50]}
              />
            </CardContent>
          </>
        )
      )}
    </Card>
  );
};

export default CharactersContainer;
