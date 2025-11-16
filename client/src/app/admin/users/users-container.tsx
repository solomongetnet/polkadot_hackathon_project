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
import { useGetUsersForAdminQuery } from "@/hooks/api/use-user";
import { useSearchParams } from "next/navigation";
import {
  clearAllSearchParams,
  deleteSearchParam,
  setValueToSearchParam,
} from "@/utils/search-params";
import { UsersTableSkeleton } from "./loaders";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import RefetchDataButton from "../_components/refetch-data-button";

const UsersContainer = () => {
  const searchParams = useSearchParams();
  const pageSearchParam = Number(searchParams.get("page")) || 1;
  const limitSearchParam = Number(searchParams.get("limit")) || 5;
  const querySearchParam = searchParams.get("query") || undefined;
  const sortDirectionSearchParam =
    searchParams.get("sortDirection") || undefined;
  const sortFieldSearchParam = searchParams.get("sortField") || undefined;
  const userRoleSearchParam = searchParams.get("userRole") || undefined;
  const userStatusSearchParam = searchParams.get("userStatus") || undefined;

  const usersDataQuery = useGetUsersForAdminQuery({
    limit: limitSearchParam,
    page: pageSearchParam,
    search: querySearchParam,
    sortDirection: sortDirectionSearchParam,
    sortField: sortFieldSearchParam,
    role: userRoleSearchParam,
    status: userStatusSearchParam,
  });

  useEffect(() => {
    usersDataQuery.refetch();
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
      {usersDataQuery.isPending || usersDataQuery.isFetching k? (
        <UsersTableSkeleton />
      ) : (
        usersDataQuery.data?.data && (
          <>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Detailed Users Information
              </CardTitle>

              <div className="flex items-center gap-1 sm:gap-2">
                <RefetchDataButton
                  refetch={usersDataQuery.refetch}
                  isLoading={usersDataQuery.isFetching}
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
              {usersDataQuery.data.data.length < 1 ||
              !usersDataQuery.data.data ? (
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
                      <TableHead>User</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Favorite Character</TableHead>
                      <TableHead>Total Tokens</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersDataQuery.data.data.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user.image || "/placeholder.svg"}
                              size={"md"}
                              fallback={user.name}
                            />
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{"Pro"}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {"Luna"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {/* {user.totalTokens.toLocaleString()} */}
                          2000
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {/* {formatDate(user.createdAt})} */}
                          2025
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <Pagination
                currentPage={usersDataQuery.data.pagination.currentPage}
                totalPages={usersDataQuery.data.pagination.totalPages}
                totalItems={usersDataQuery.data.pagination.totalItems}
                limit={usersDataQuery.data.pagination.limit}
                hasMore={usersDataQuery.data.pagination.hasMore}
                previousPage={usersDataQuery.data.pagination.previousPage}
                nextPage={usersDataQuery.data.pagination.nextPage}
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

export default UsersContainer;
