// import "reflect-metadata"
// import {
//     createTestingConnections,
//     closeTestingConnections,
//     reloadTestingDatabases,
// } from "../../utils/test-utils"
// import { DataSource } from "../../../src/data-source/DataSource"
// import { Post } from "./entity/post.entity"
// import { Comment } from "./entity/comment.entity"
// import { IsNull } from "../../../src"

// describe("github issues > #6647 @OnyToMany relation find empty array", () => {
//     let dataSources: DataSource[]
//     before(
//         async () =>
//             (dataSources = await createTestingConnections({
//                 entities: [__dirname + "/entity/*{.js,.ts}"],
//                 schemaCreate: true,
//                 dropSchema: true,
//             })),
//     )
//     beforeEach(() => reloadTestingDatabases(dataSources))
//     after(() => closeTestingConnections(dataSources))

//     it("should find all posts without comments and all orphaned comments", () =>
//         Promise.all(
//             dataSources.map(async (dataSource) => {
//                 const postRepo = dataSource.getRepository(Post)

//                 await postRepo.save({ body: "post" })

//                 const commRepo = dataSource.getRepository(Comment)

//                 await commRepo.save({ message: "comment" })

//                 const orphanedComments = await commRepo.find({
//                     where: { post: IsNull() },
//                 })

//                 console.log(orphanedComments)

//                 // throws an error 
//                 const postsWithoutComments = await postRepo.find({
//                     where: { comments: IsNull() },
//                 })

//                 console.log(postsWithoutComments)
//             }),
//         ))
// })