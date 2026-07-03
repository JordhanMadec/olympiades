import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveRulesColumn1720046549000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the column exists before trying to drop it
    const table = await queryRunner.getTable("games");
    const rulesColumn = table?.findColumnByName("rules");

    if (rulesColumn) {
      await queryRunner.dropColumn("games", "rules");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore the rules column if migration is reverted
    await queryRunner.addColumn(
      "games",
      new TableColumn({
        name: "rules",
        type: "text",
        isNullable: false,
        default: "''",
      })
    );
  }
}
